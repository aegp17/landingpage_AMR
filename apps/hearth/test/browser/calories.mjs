// The Calories tab: the target, logging food and exercise, the day rollover,
// and living next to the fasting log without touching it.
//   node apps/hearth/test/browser/calories.mjs
import { readFileSync } from 'node:fs'
import { HOUR, PHONE, launchChromium, reporter, site, stored } from './harness.mjs'

const { check, finish } = reporter()
const server = site()
await server.ready()
const browser = await launchChromium()
const context = await browser.newContext({ ...PHONE, acceptDownloads: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const calories = () => page.evaluate(() => JSON.parse(localStorage.getItem('hearth.calories.v1')))
const budget = async () => ({
  label: await page.textContent('#budgetLabel'),
  value: await page.textContent('#budgetValue'),
  target: await page.textContent('#partTarget'),
  food: await page.textContent('#partFood'),
  exercise: await page.textContent('#partExercise'),
})
async function addEntry(kind, kcal, label = '') {
  await page.click(kind === 'food' ? '#addFoodBtn' : '#addExerciseBtn')
  await page.fill('#entryKcal', String(kcal))
  if (label) await page.fill('#entryLabel', label)
  await page.click('#entryForm button[type=submit]')
}

await page.goto(server.appUrl)
await page.waitForLoadState('networkidle')

// ------------------------------------------------------------ tabs
check('opens on the fasting tab', (await page.isVisible('#fastingTab')) && !(await page.isVisible('#caloriesTab')))
await page.click('#tabCalories')
check('switches to calories', (await page.isVisible('#caloriesTab')) && !(await page.isVisible('#fastingTab')))
check('starts without a target', (await budget()).label === 'No target yet')
await page.reload()
check('remembers the tab', await page.isVisible('#caloriesTab'))

// ------------------------------------------------------------ your numbers
await page.click('#numbersBtn')
check('the numbers dialog opens', await page.isVisible('#numbersDialog'))
check('asks for the numbers before estimating', (await page.textContent('#planBox')).includes('Fill your age'))
await page.click('#sexGroup button[data-sex="male"]')
await page.fill('#ageInput', '34')
await page.fill('#heightInput', '178')
await page.fill('#weightInput', '82')
await page.selectOption('#activitySelect', 'light')
await page.selectOption('#goalSelect', '0.5')
const preview = await page.textContent('#planBox')
// Mifflin-St Jeor: 1768 BMR, x1.375 = 2431 maintenance, minus 550 -> 1880
check('previews the estimate as you type', preview.includes('2,431') && preview.includes('550') && preview.includes('1,880'), preview.replace(/\s+/g, ' '))
await page.click('#numbersForm button[type=submit]')
check('saves the profile', (await calories()).profile.weightKg === 82)
check('the target lands on the card', (await budget()).target === '1,880', JSON.stringify(await budget()))
check('and the day starts whole', (await budget()).label === 'Left today' && (await budget()).value === '1,880')

// ------------------------------------------------------------ logging
await addEntry('food', 640, 'Almuerzo')
check('food spends the budget', (await budget()).value === '1,240', JSON.stringify(await budget()))
check('the entry shows what and when', (await page.textContent('#entryList')).includes('Almuerzo') && (await page.textContent('#entryList')).includes('640 kcal'))
await addEntry('exercise', 320, 'Gym')
check('exercise gives it back', (await budget()).value === '1,560' && (await budget()).exercise === '320', JSON.stringify(await budget()))
check('exercise reads as a plus', (await page.textContent('#entryList')).includes('+320 kcal'))

await addEntry('food', 2000)
const over = await budget()
check('going over says so', over.label === 'Over by' && over.value === '440', JSON.stringify(over))
check('and the card flags it', await page.evaluate(() => document.getElementById('caloriesTab').classList.contains('over')))

// ------------------------------------------------------------ undo and validation
const beforeDelete = (await calories()).entries.length
await page.click('#entryList .meal-delete >> nth=0')
check('deletes an entry', (await calories()).entries.length === beforeDelete - 1)
await page.click('#toastAction')
check('undo brings it back', (await calories()).entries.length === beforeDelete)

await page.click('#addFoodBtn')
await page.fill('#entryKcal', '0')
await page.click('#entryForm button[type=submit]')
check('refuses a zero', (await page.textContent('#entryError')).includes('between 1 and 10,000'))
await page.fill('#entryKcal', '50000')
await page.click('#entryForm button[type=submit]')
check('refuses an absurd number', (await page.textContent('#entryError')).includes('between 1 and 10,000'))
await page.click('#entryDialog [data-close]')

await page.click('#numbersBtn')
await page.fill('#ageInput', '')
await page.click('#numbersForm button[type=submit]')
check('refuses a profile without an age', (await page.textContent('#numbersError')).includes('Age between'))
await page.fill('#ageInput', '34')

// ------------------------------------------------------------ own target and the floor
await page.fill('#overrideInput', '1700')
await page.click('#numbersForm button[type=submit]')
check('an own target wins over the suggestion', (await budget()).target === '1,700')

await page.click('#numbersBtn')
await page.click('#sexGroup button[data-sex="female"]')
await page.fill('#ageInput', '60')
await page.fill('#heightInput', '150')
await page.fill('#weightInput', '48')
await page.selectOption('#activitySelect', 'sedentary')
await page.selectOption('#goalSelect', '1')
check('warns instead of steering too low', (await page.textContent('#planBox')).includes('1,200'), (await page.textContent('#planBox')).replace(/\s+/g, ' '))
await page.click('#numbersDialog [data-close]')

// ------------------------------------------------------------ yesterday
await page.evaluate((yesterday) => {
  const state = JSON.parse(localStorage.getItem('hearth.calories.v1'))
  state.entries.push({ id: 'seed-1', at: yesterday, kind: 'food', kcal: 1500, label: 'Ayer' })
  localStorage.setItem('hearth.calories.v1', JSON.stringify(state))
}, Date.now() - 24 * HOUR)
await page.reload()
check("yesterday's food is not in today's total", (await budget()).food !== '1,500', JSON.stringify(await budget()))
check('it shows under earlier days, measured against the target', (await page.textContent('#daysList')).includes('200 under'), await page.textContent('#daysList'))

// ------------------------------------------------------------ the two tabs stay apart
await page.click('#tabFasting')
await page.click('#eatBtn')
check('fasting still works', (await stored(page)).meals.length === 1)
check('and keeps its own key', (await calories()).entries.length > 0 && (await stored(page)).meals.length === 1)
await page.reload()
check('the app reopens on the tab you left', await page.isVisible('#fastingTab'))

// ------------------------------------------------------------ backup covers both
await page.click('#settingsBtn')
check('the summary counts both logs', (await page.textContent('#settingsSummary')).includes('meal') && (await page.textContent('#settingsSummary')).includes('calorie'), await page.textContent('#settingsSummary'))
const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')])
const backupPath = await download.path()
const backup = JSON.parse(readFileSync(backupPath, 'utf8'))
check('the backup carries the calories too', backup.calories.entries.length === (await calories()).entries.length && backup.calories.profile.sex === 'male')

if (!(await page.isVisible('#settingsDialog'))) await page.click('#settingsBtn')
await page.click('#clearBtn')
await page.click('#clearBtn')
check('erase clears both logs', (await stored(page)).meals.length === 0 && (await calories()).entries.length === 0 && (await calories()).profile === null)
await page.click('#toastAction')
check('undo restores both', (await stored(page)).meals.length === 1 && (await calories()).entries.length > 0)

await page.click('#settingsBtn')
await page.click('#clearBtn')
await page.click('#clearBtn')
await page.click('#settingsBtn')
await page.setInputFiles('#importInput', backupPath)
await page.waitForTimeout(400)
check('importing the file brings both back', (await stored(page)).meals.length === 1 && (await calories()).entries.length > 0, await page.textContent('#toastText'))

// An old backup, from before this tab existed, must not break the import.
await page.click('#settingsBtn')
await page.setInputFiles('#importInput', {
  name: 'old.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ app: 'hearth', version: 1, goalHours: 16, meals: [{ at: Date.now() - 5 * HOUR }] })),
})
await page.waitForTimeout(400)
check('an older backup imports without wiping the calories', (await calories()).entries.length > 0, await page.textContent('#toastText'))

check('no console errors', errors.filter((e) => !e.includes('ERR_INTERNET_DISCONNECTED')).length === 0, errors.join(' | '))

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
