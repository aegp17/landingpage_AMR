// The goal alarm and the calendar event.
//   node apps/hearth/test/browser/reminders.mjs
import { readFileSync } from 'node:fs'
import { HOUR, PHONE, launchChromium, reporter, seed, site, state, stored } from './harness.mjs'

const { check, finish } = reporter()
const server = site()
await server.ready()
const browser = await launchChromium()

// Records what the app asks the system to show; Playwright cannot read notifications back.
const recordNotifications = () => {
  window.__notes = []
  const original = ServiceWorkerRegistration.prototype.showNotification
  ServiceWorkerRegistration.prototype.showNotification = function (title, options) {
    window.__notes.push({ title, ...options })
    return original.call(this, title, options)
  }
}

async function open({ notifications = true, saved = null } = {}) {
  const context = await browser.newContext({ ...PHONE, acceptDownloads: true })
  if (notifications) await context.grantPermissions(['notifications'], { origin: server.base })
  const page = await context.newPage()
  await page.addInitScript(recordNotifications)
  await page.goto(server.appUrl)
  if (saved) {
    await seed(page, saved)
    await page.reload()
  }
  return { context, page }
}

const notes = (page) => page.evaluate(() => window.__notes)
const openReminders = async (page) => {
  await page.click('#settingsBtn')
  await page.click('#remindersRow')
}

// ------------------------------------------------------------ the switch
{
  const { context, page } = await open()
  await openReminders(page)
  check('Reminders opens from Settings', await page.isVisible('#remindersDialog'))
  check('starts off', (await page.getAttribute('#remindToggle', 'aria-checked')) === 'false')
  check('says it is off', (await page.textContent('#remindStatus')).startsWith('Off.'))
  check('no calendar without a fast', await page.isDisabled('#calendarBtn'), await page.textContent('#calendarHint'))

  await page.click('#remindToggle')
  check('turns on', (await page.getAttribute('#remindToggle', 'aria-checked')) === 'true')
  check('explains when it alerts', (await page.textContent('#remindStatus')).startsWith('On.'), await page.textContent('#remindStatus'))
  check('remembers it', (await stored(page)).remindAtGoal === true)
  await page.click('#remindToggle')
  check('turns off again', (await stored(page)).remindAtGoal === false)
  await context.close()
}

// ------------------------------------------------------------ the alarm
{
  const mealAt = Date.now() - 16 * HOUR + 4000 // the goal lands in about 4 seconds
  const { context, page } = await open({ saved: state({ meals: [{ at: mealAt }], remindAtGoal: true }) })
  check('silent before the goal', (await notes(page)).length === 0)
  await page.waitForFunction(() => window.__notes.length > 0, null, { timeout: 15000 })
  const [note] = await notes(page)
  check('alarms at the goal', note.title === '16h fast complete', note.title)
  check('the alarm invites the next meal', note.body === 'Goal reached. Eat when you are ready, then tap “I ate”.', note.body)
  check('it carries the app icon and one tag', note.icon.endsWith('/icons/icon-192.png') && note.tag === 'hearth-goal')
  check('and shows in the app too', (await page.textContent('#toastText')) === '16h fast complete.', await page.textContent('#toastText'))
  check('remembers it alarmed', (await stored(page)).notifiedFor === mealAt)
  await page.waitForTimeout(3000)
  check('never repeats for the same meal', (await notes(page)).length === 1)

  await page.click('#eatBtn')
  const next = await stored(page)
  check('a new meal arms it again', next.notifiedFor !== next.meals.at(-1).at)
  await context.close()
}

// ------------------------------------------------------------ when it must stay quiet
{
  const { context, page } = await open({ saved: state({ meals: [{ at: Date.now() - 16 * HOUR + 3000 }] }) })
  await page.waitForTimeout(6000)
  check('no alarm while the switch is off', (await notes(page)).length === 0)
  await context.close()
}
{
  const mealAt = Date.now() - 17 * HOUR
  const { context, page } = await open({ saved: state({ meals: [{ at: mealAt }] }) })
  await openReminders(page)
  await page.click('#remindToggle')
  await page.waitForTimeout(2500)
  check('turning it on past the goal does not alarm at once', (await notes(page)).length === 0)
  check('it is armed for the next fast instead', (await stored(page)).notifiedFor === mealAt)
  check('and the calendar says the goal has passed', await page.isDisabled('#calendarBtn'))
  await context.close()
}

// ------------------------------------------------------------ permission refused
//
// A real click opens the browser's own prompt, which Playwright leaves hanging,
// so the two answers are simulated by replacing the Notification API.
// The value travels as an argument: an init script cannot close over one.
const ANSWER = (value) => {
  Object.defineProperty(Notification, 'permission', { get: () => value, configurable: true })
  Notification.requestPermission = () => Promise.resolve(value)
}

{
  const context = await browser.newContext(PHONE)
  const page = await context.newPage()
  await page.addInitScript(ANSWER, 'denied')
  await page.goto(server.appUrl)
  await openReminders(page)
  check('blocked: status says so before you even try', (await page.textContent('#remindStatus')).startsWith('Blocked.'), await page.textContent('#remindStatus'))
  await page.click('#remindToggle')
  await page.waitForTimeout(400)
  check('blocked: stays off', (await page.getAttribute('#remindToggle', 'aria-checked')) === 'false')
  check('blocked: points at the browser settings', (await page.textContent('#toastText')).includes('browser settings'), await page.textContent('#toastText'))
  check('blocked: never claims to be on', (await stored(page))?.remindAtGoal !== true)
  await context.close()
}

{
  const context = await browser.newContext(PHONE)
  const page = await context.newPage()
  await page.addInitScript(ANSWER, 'default')
  await page.goto(server.appUrl)
  await openReminders(page)
  await page.click('#remindToggle')
  await page.waitForTimeout(400)
  check('dismissed: stays off', (await page.getAttribute('#remindToggle', 'aria-checked')) === 'false')
  check('dismissed: asks for the permission', (await page.textContent('#toastText')) === 'Allow notifications to hear the alarm.', await page.textContent('#toastText'))
  await context.close()
}

// ------------------------------------------------------------ the calendar file
{
  const mealAt = Date.now() - 2 * HOUR
  const { context, page } = await open({ saved: state({ goalHours: 18, meals: [{ at: mealAt }] }) })
  await openReminders(page)
  check('offered during a fast', !(await page.isDisabled('#calendarBtn')))
  const hint = await page.textContent('#calendarHint')
  check('the hint names the time and the point of it', hint.startsWith('Alarm at ') && hint.includes('with Hearth closed'), hint)

  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#calendarBtn')])
  const ics = readFileSync(await download.path(), 'utf8')
  const expected = new Date(mealAt + 18 * HOUR).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  check('file name', /^hearth-goal-\d{4}-\d{2}-\d{2}\.ics$/.test(download.suggestedFilename()), download.suggestedFilename())
  check('the event starts at the goal', ics.includes(`DTSTART:${expected}`), ics.split('\r\n').find((l) => l.startsWith('DTSTART')))
  check('with an alarm on it', ics.includes('BEGIN:VALARM') && ics.includes('TRIGGER:PT0S'))
  check('named after the goal', ics.includes('SUMMARY:Fasting goal reached (18h)'))
  await context.close()
}

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
