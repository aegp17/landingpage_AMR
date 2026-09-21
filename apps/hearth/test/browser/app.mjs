// The everyday flows, in a real browser: logging, undo, goal, history, backup,
// offline, and the worker staying inside its own folder.
//   node apps/hearth/test/browser/app.mjs
import { readFileSync } from 'node:fs'
import { HOUR, PHONE, launchChromium, localInput, reporter, seed, site, state, stored } from './harness.mjs'

const { check, finish } = reporter()
const server = site()
await server.ready()
const browser = await launchChromium()
const context = await browser.newContext({ ...PHONE, acceptDownloads: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(server.appUrl)
await page.waitForLoadState('networkidle')

// ------------------------------------------------------------ empty state
check('title', (await page.title()) === 'Hearth')
check('asks not to be indexed', (await page.getAttribute('meta[name=robots]', 'content')).includes('noindex'))
check('invites the first meal', (await page.textContent('#clockMain')) === 'Ready when you are')
check('empty history', await page.isVisible('#historyEmpty'))

// ------------------------------------------------------------ I ate
const before = Date.now()
await page.click('#eatBtn')
const first = await stored(page)
check('stores one meal, timed now', first.meals.length === 1 && first.meals[0].at >= before && first.meals[0].at <= Date.now())
check('clock starts', (await page.textContent('#clockMain')) === '0:00')
check('offers undo', await page.isVisible('#toastAction'))
await page.click('#eatBtn')
check('ignores a double tap', (await stored(page)).meals.length === 1)
check('and says why', (await page.textContent('#toastText')).includes('Already logged'))
await page.waitForTimeout(2100)
check('clock ticks', (await page.textContent('#clockSec')) !== ':00')
await page.reload()
check('survives a reload', (await stored(page)).meals.length === 1)

// ------------------------------------------------------------ undo
await seed(page, state({ meals: [{ at: Date.now() - 10 * HOUR }] }))
await page.reload()
await page.click('#eatBtn')
check('toast names the fast just ended', (await page.textContent('#toastText')).includes('after a 10h fast'), await page.textContent('#toastText'))
await page.click('#toastAction')
check('undo removes the meal', (await stored(page)).meals.length === 1)
check('and the clock goes back', (await page.textContent('#clockMain')).startsWith('10:'), await page.textContent('#clockMain'))

// ------------------------------------------------------------ earlier meal
await page.click('#earlierBtn')
check('dialog opens', await page.isVisible('#earlierDialog'))
await page.fill('#earlierInput', await localInput(page, 2 * HOUR))
await page.click('#earlierForm button[type=submit]')
check('refuses the future', (await page.textContent('#earlierError')).includes('future'))
const threeHoursAgo = await localInput(page, -3 * HOUR)
await page.fill('#earlierInput', threeHoursAgo)
await page.click('#earlierForm button[type=submit]')
check('saves an earlier meal', (await stored(page)).meals.length === 2 && !(await page.isVisible('#earlierDialog')))
check('clock counts from it', (await page.textContent('#clockMain')).startsWith('3:') || (await page.textContent('#clockMain')).startsWith('2:'))
await page.click('#earlierBtn')
await page.fill('#earlierInput', threeHoursAgo)
await page.click('#earlierForm button[type=submit]')
check('refuses the same minute twice', (await page.textContent('#earlierError')).includes('already'))
await page.click('#earlierDialog [data-close]')

// ------------------------------------------------------------ goal
await page.click('#goalBtn')
await page.click('.goal-option[data-hours="18"]')
check('goal saved', (await stored(page)).goalHours === 18)
await page.click('#goalDialog [data-close]')
check('chip updated', (await page.textContent('#goalBtn')).startsWith('Goal 18h'), await page.textContent('#goalBtn'))

// ------------------------------------------------------------ history
const count = (await stored(page)).meals.length
await page.click('.meal-delete >> nth=0')
check('deletes a meal', (await stored(page)).meals.length === count - 1)
await page.click('#toastAction')
check('undo brings it back', (await stored(page)).meals.length === count)

// ------------------------------------------------------------ backup
await page.click('#settingsBtn')
const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')])
const backupPath = await download.path()
const backup = JSON.parse(readFileSync(backupPath, 'utf8'))
check('export carries the meals with a readable local time', backup.app === 'hearth' && backup.meals.length === count && /[+-]\d{2}:\d{2}$/.test(backup.meals[0].local), backup.meals[0].local)

if (!(await page.isVisible('#settingsDialog'))) await page.click('#settingsBtn')
await page.click('#clearBtn')
check('erasing asks twice', (await stored(page)).meals.length === count)
await page.click('#clearBtn')
check('erases meals but keeps the goal', (await stored(page)).meals.length === 0 && (await stored(page)).goalHours === 18)

await page.click('#settingsBtn')
await page.setInputFiles('#importInput', backupPath)
await page.waitForTimeout(300)
check('import brings them back', (await stored(page)).meals.length === count, await page.textContent('#toastText'))
await page.click('#settingsBtn')
await page.setInputFiles('#importInput', { name: 'other.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') })
await page.waitForTimeout(300)
check('refuses a foreign file', (await page.textContent('#toastText')).includes("isn't a Hearth backup"))

// ------------------------------------------------------------ damaged storage
await page.evaluate(() => localStorage.setItem('hearth.v1', '{broken'))
await page.reload()
const parked = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('hearth.v1.unreadable.')))
check('parks an unreadable log instead of overwriting it', parked.length === 1)

// ------------------------------------------------------------ worker and offline
const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
check('worker scoped to the app folder', scope === server.appUrl, scope)
await page.reload()
await page.waitForTimeout(500)
await context.setOffline(true)
await page.reload()
check('works offline', (await page.title()).endsWith('Hearth') && (await page.isVisible('#eatBtn')))
await context.setOffline(false)

await page.goto(server.landingUrl)
await page.waitForLoadState('networkidle')
check('the rest of the site is not controlled by it', !(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))

// ------------------------------------------------------------ narrow screen
const narrow = await browser.newContext({ viewport: { width: 320, height: 640 } })
const narrowPage = await narrow.newPage()
await narrowPage.goto(server.appUrl)
await seed(narrowPage, state({ meals: [{ at: Date.now() - 123.5 * HOUR }] }))
await narrowPage.reload()
check('no sideways scroll at 320px with a 123h fast', (await narrowPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0)
await narrow.close()

check('no unexpected console errors', errors.filter((e) => !e.includes('ERR_INTERNET_DISCONNECTED')).length === 0, errors.join(' | '))

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
