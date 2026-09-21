// Deploys happening while the app is open: it installs the new build, reloads
// itself, keeps the meals, and refuses a half-propagated deploy.
//   node apps/hearth/test/browser/update.mjs
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PHONE, launchChromium, reporter, site, stored } from './harness.mjs'

const { check, finish } = reporter()
const server = site({ build: { id: 'aaaaaaa', date: '2026-09-17' } })
await server.ready()
const browser = await launchChromium()
const context = await browser.newContext(PHONE)
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const version = async () => {
  await page.click('#aboutBtn')
  const text = await page.textContent('#aboutVersion')
  await page.click('#aboutDialog [data-close]')
  return text
}
const cacheKeys = () => page.evaluate(() => caches.keys())
const toForeground = () => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))

await page.goto(server.appUrl)
await page.evaluate(() => navigator.serviceWorker.ready)
await page.waitForFunction(() => navigator.serviceWorker.controller)

check('About shows the stamped build', (await version()) === 'Version aaaaaaa · Sep 17, 2026', await version())

await page.click('#eatBtn')
const mealAt = (await stored(page)).meals[0].at
let reloaded = false
page.on('framenavigated', (frame) => frame === page.mainFrame() && (reloaded = true))
await toForeground()
await page.waitForTimeout(2500)
check('same build: nothing happens', !reloaded)

// ------------------------------------------------------------ a deploy lands
server.deploy('bbbbbbb', '2026-09-18')
await Promise.all([page.waitForEvent('load', { timeout: 20000 }), toForeground()])
await page.waitForSelector('#toast.show', { timeout: 5000 })
check('reloads by itself', true)
check('announces the new version', (await page.textContent('#toastText')) === 'Hearth updated to bbbbbbb.', await page.textContent('#toastText'))
check('runs the new build', (await version()) === 'Version bbbbbbb · Sep 18, 2026')
check('drops the old cache', JSON.stringify(await cacheKeys()) === '["hearth-bbbbbbb"]', JSON.stringify(await cacheKeys()))
const after = await stored(page)
check('meals survive', after.meals.length === 1 && after.meals[0].at === mealAt)

// ------------------------------------------------------------ a deploy during a dialog
await page.click('#earlierBtn')
server.deploy('ccccccc', '2026-09-19')
reloaded = false
await toForeground()
await page.waitForFunction(async () => (await caches.keys()).includes('hearth-ccccccc'), null, { timeout: 20000 })
await page.waitForTimeout(1500)
check('waits while a dialog is open', !reloaded && (await page.isVisible('#earlierDialog')))
await Promise.all([page.waitForEvent('load', { timeout: 20000 }), page.click('#earlierDialog [data-close]')])
check('reloads once it closes', (await version()) === 'Version ccccccc · Sep 19, 2026')

// ------------------------------------------------------------ offline on the new build
await context.setOffline(true)
await page.reload()
check('the updated build works offline', (await page.title()).endsWith('Hearth') && (await version()) === 'Version ccccccc · Sep 19, 2026')
await toForeground()
await page.waitForTimeout(500)
await context.setOffline(false)

// ------------------------------------------------------------ a half-propagated deploy
server.deploy('ccccccc', '2026-09-19')
writeFileSync(join(server.root, 'app', 'version.json'), '{ "id": "ddddddd", "date": "2026-09-20" }')
reloaded = false
await toForeground()
await page.waitForTimeout(4000)
check('mismatched files: stays on the build that works', !reloaded && !(await cacheKeys()).includes('hearth-ddddddd'), JSON.stringify(await cacheKeys()))

check('no unexpected console errors', errors.filter((e) => !e.includes('ERR_INTERNET_DISCONNECTED') && !e.includes('sw.js?v=ddddddd')).length === 0, errors.join(' | '))

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
