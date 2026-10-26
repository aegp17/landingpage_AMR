import { readFileSync } from 'node:fs'
import { PHONE, launchChromium, reporter, site } from './harness.mjs'

const { check, finish } = reporter()
const server = site()
await server.ready()
const browser = await launchChromium()
const context = await browser.newContext({ ...PHONE, acceptDownloads: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('requestfailed', (r) => {
  const path = new URL(r.url()).pathname
  if (!path.endsWith('/version.json')) errors.push(`request ${path} ${r.failure()?.errorText}`)
})

const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('hearth.barbell.v1')))
const totals = async () => ({ lb: await page.textContent('#barTotalLb'), kg: await page.textContent('#barTotalKg') })
const count = (lb) => page.textContent(`[data-count="${lb}"]`)
const add = (lb) => page.click(`[data-plus="${lb}"]`)
const remove = (lb) => page.click(`[data-minus="${lb}"]`)
const plates = () => page.$$eval('#barDrawing rect', (nodes) => nodes.length)

await page.goto(server.appUrl)
await page.waitForLoadState('networkidle')

await page.click('#tabBarbell')
await page.waitForFunction(() => document.querySelectorAll('#barDrawing rect').length > 0)
check('a fourth tab, on its own screen', (await page.isVisible('#barbellTab')) && !(await page.isVisible('#fastingTab')))
check('it opens with the empty 45 lb bar', (await totals()).lb === '45' && (await totals()).kg === '20.4 kg', JSON.stringify(await totals()))
check('and says so', (await page.textContent('#barNote')) === 'Empty bar.', await page.textContent('#barNote'))
check('the bar is drawn', (await plates()) > 0)
check('per side reads empty', (await page.textContent('#barSide')) === 'Per side: no plates')

await add(45)
check('a plate adds a pair', (await totals()).lb === '135', JSON.stringify(await totals()))
check('the count is per side', (await count(45)) === '1')
check('kilos follow', (await totals()).kg === '61.2 kg')
await add(25)
check('a second plate', (await totals()).lb === '185' && (await totals()).kg === '83.9 kg')
check('per side lists them heaviest first', (await page.textContent('#barSide')) === 'Per side: 45 + 25')
check('and the sleeve is measured', (await page.textContent('#barNote')) === '315.9 mm left on the sleeve.', await page.textContent('#barNote'))
const drawnWithTwo = await plates()

await add(2.5)
check('the small plates count too', (await totals()).lb === '190')
check('they go last on the sleeve', (await page.textContent('#barSide')) === 'Per side: 45 + 25 + 2.5')
check('the drawing grew', (await plates()) > drawnWithTwo)

await remove(2.5)
check('minus takes the pair off', (await totals()).lb === '185' && (await count(2.5)) === '0')
check('minus is disabled at zero', await page.isDisabled('[data-minus="2.5"]'))
check('the loaded rows are marked', (await page.$$('.plate-row.loaded')).length === 2)

const savedCounts = (await stored()).counts
check('the load is saved', savedCounts['45'] === 1 && savedCounts['25'] === 1 && Object.keys(savedCounts).length === 2, JSON.stringify(savedCounts))
await page.reload()
await page.waitForLoadState('networkidle')
check('and comes back after a reload', (await totals()).lb === '185' && (await page.isVisible('#barbellTab')))

while (!(await page.isDisabled('[data-plus="45"]'))) await add(45)
check('the sleeve fills up at six 45s', (await count(45)) === '6', await count(45))
check('and then refuses more', await page.isDisabled('[data-plus="45"]'))
check('while a thin plate still fits', !(await page.isDisabled('[data-plus="2.5"]')))
check('the total is right at the limit', (await totals()).lb === '635', JSON.stringify(await totals()))

await page.click('[data-bar="35"]')
check('the lighter bar drops what no longer fits', (await count(45)) === '5', await count(45))
check('and the bar weight changes', (await totals()).lb === '485', JSON.stringify(await totals()))
check('the choice is stored', (await stored()).bar === '35')

await page.click('#barClear')
check('clearing leaves the bar alone', (await totals()).lb === '35' && (await stored()).bar === '35')
check('with no plates', JSON.stringify((await stored()).counts) === '{}')

await page.click('#settingsBtn')
const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')])
const backup = JSON.parse(readFileSync(await download.path(), 'utf8'))
check('the backup carries the bar', backup.barbell.bar === '35' && JSON.stringify(backup.barbell.counts) === '{}', JSON.stringify(backup.barbell))
await page.click('#settingsDialog [data-close]')

await page.click('#tabCalories')
check('the other tabs still work', await page.isVisible('#caloriesTab'))
await page.click('#tabBarbell')
await add(35)
check('and the bar tab keeps its own key', (await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('hearth.')).sort().join(','))).includes('hearth.barbell.v1'))

const context2 = await browser.newContext({ ...PHONE, locale: 'es-EC' })
const spanish = await context2.newPage()
await spanish.goto(server.appUrl)
await spanish.waitForLoadState('networkidle')
await spanish.click('#tabBarbell')
await spanish.waitForFunction(() => document.querySelectorAll('#barDrawing rect').length > 0)
check('the tab is Spanish on a Spanish phone', (await spanish.textContent('#tabBarbell')) === 'Barra')
await spanish.click('[data-plus="2.5"]')
check('decimals follow the language', (await spanish.textContent('#barSide')) === 'Por lado: 2,5', await spanish.textContent('#barSide'))
check('and so does the note', (await spanish.textContent('#barNote')).startsWith('Quedan'), await spanish.textContent('#barNote'))
check('the buttons are Spanish', (await spanish.getAttribute('[data-plus="45"]', 'aria-label')) === 'Agregar un par de 45 lb')
await context2.close()

check('no console errors', errors.filter((e) => !e.includes('ERR_INTERNET_DISCONNECTED')).length === 0, errors.join(' | '))

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
