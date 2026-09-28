// The Protein tab: the goal, a meal built from foods, protein per food and per
// meal, and its log staying apart from the other two tabs.
//   node apps/hearth/test/browser/protein.mjs
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

const protein = () => page.evaluate(() => JSON.parse(localStorage.getItem('hearth.protein.v1')))
const card = async () => ({
  label: await page.textContent('#proteinLabel'),
  value: await page.textContent('#proteinValue'),
  unit: await page.textContent('#proteinUnit'),
  goal: await page.textContent('#proteinPartGoal'),
  today: await page.textContent('#proteinPartToday'),
  left: await page.textContent('#proteinPartLeft'),
})

await page.goto(server.appUrl)
await page.waitForLoadState('networkidle')

// ------------------------------------------------------------ the tab
await page.click('#tabProtein')
check('a third tab, on its own screen', (await page.isVisible('#proteinTab')) && !(await page.isVisible('#caloriesTab')) && !(await page.isVisible('#fastingTab')))
check('starts without a goal', (await card()).label === 'No goal yet', JSON.stringify(await card()))
await page.reload()
check('remembers the tab', await page.isVisible('#proteinTab'))

// ------------------------------------------------------------ the goal
await page.click('#proteinGoalBtn')
check('the goal dialog opens', await page.isVisible('#proteinGoalDialog'))
check('asks for the weight first', (await page.textContent('#proteinPlan')).includes('Fill your weight'))
await page.fill('#proteinWeight', '82')
await page.selectOption('#proteinPerKg', '1.6')
check('explains what the factor is for', (await page.textContent('#perKgHint')).length > 0, await page.textContent('#perKgHint'))
check('previews the goal', (await page.textContent('#proteinPlan')).includes('131 g a day'), (await page.textContent('#proteinPlan')).replace(/\s+/g, ' '))
await page.click('#proteinGoalForm button[type=submit]')
check('the goal is saved', (await protein()).weightKg === 82 && (await protein()).perKg === 1.6)
check('and lands on the card', (await card()).goal === '131 g', JSON.stringify(await card()))

// ------------------------------------------------------------ a meal, food by food
await page.click('#addProteinBtn')
check('the picker is there', await page.isVisible('#proteinSearch'))
await page.fill('#proteinSearch', 'pollo')
const per100 = await page.textContent('#proteinResults .food-result:first-child .food-result-name span')
check('each food shows its protein per 100 g', per100 === '31 g protein per 100 g', per100)
const chip = await page.textContent('#proteinResults .food-result:first-child .portion-chip')
check('portions are priced in protein, not calories', chip.includes('g') && !chip.includes('kcal'), chip)

await page.click('#proteinResults .food-result:first-child .food-result-name')
const firstGrams = await page.inputValue('#proteinItems .food-item input')
check('the food joins the meal with its portion', (await page.$$('#proteinItems .food-item')).length === 1, `${firstGrams} g`)
await page.fill('#proteinItems .food-item input', '150')
await page.waitForTimeout(150)
check('protein per food follows the grams', (await page.textContent('#proteinItems .food-item .food-item-kcal')) === '47 g', await page.textContent('#proteinItems .food-item .food-item-kcal'))

await page.fill('#proteinSearch', 'arroz')
await page.click('#proteinResults .food-result:first-child .food-result-name')
await page.fill('#proteinItems .food-item:nth-child(2) input', '158')
await page.waitForTimeout(150)
check('a second food joins it', (await page.$$('#proteinItems .food-item')).length === 2)
check('the meal totals its foods', (await page.textContent('#proteinTotal')) === 'Total 51 g', await page.textContent('#proteinTotal'))
check('the button says what it will add', (await page.textContent('#proteinSave')) === 'Add 51 g')
check('and the typed field steps aside', !(await page.isVisible('#proteinManualField')))

await page.fill('#proteinMealName', 'Almuerzo')
await page.click('#proteinForm button[type=submit]')
const saved = (await protein()).entries.at(-1)
check('the meal is saved with its foods', saved.items.length === 2 && saved.protein === 50.8, JSON.stringify(saved.items))
check('the day adds up', (await card()).today === '51 g' && (await card()).left === '80 g', JSON.stringify(await card()))
check('the meal row shows the total', (await page.textContent('#proteinList')).includes('51 g protein') && (await page.textContent('#proteinList')).includes('Almuerzo'))
check(
  'and breaks it down food by food, the decimal only where it matters',
  (await page.textContent('#proteinList')).includes('Chicken breast, roasted · 150 g47 g') &&
    (await page.textContent('#proteinList')).includes('White rice, cooked · 158 g4.3 g'),
  await page.textContent('#proteinList'),
)

// ------------------------------------------------------------ typing it by hand
await page.click('#addProteinBtn')
await page.fill('#proteinGrams', '30')
await page.fill('#proteinMealName', 'Shake')
await page.click('#proteinForm button[type=submit]')
check('a meal can still be typed', (await protein()).entries.at(-1).protein === 30)
check('the day follows', (await card()).today === '81 g', JSON.stringify(await card()))

await page.click('#addProteinBtn')
await page.click('#proteinForm button[type=submit]')
check('refuses an empty meal', (await page.textContent('#proteinError')).includes('Pick a food above'))
await page.fill('#proteinGrams', '900')
await page.click('#proteinForm button[type=submit]')
check('refuses an absurd amount', (await page.textContent('#proteinError')).includes('between 1 and 500'))
await page.click('#proteinDialog [data-close]')

// ------------------------------------------------------------ reaching the goal
await page.click('#addProteinBtn')
await page.fill('#proteinGrams', '60')
await page.click('#proteinForm button[type=submit]')
check('reaching the goal is celebrated, not flagged', (await card()).label === 'Goal reached' && (await card()).left === 'Done', JSON.stringify(await card()))
check('the toast says so', (await page.textContent('#toastText')).includes('goal reached'), await page.textContent('#toastText'))

// ------------------------------------------------------------ undo
const before = (await protein()).entries.length
await page.click('#proteinList .meal-delete >> nth=0')
check('a meal can be removed', (await protein()).entries.length === before - 1)
await page.click('#toastAction')
check('undo brings it back', (await protein()).entries.length === before)

// ------------------------------------------------------------ yesterday
await page.evaluate((yesterday) => {
  const state = JSON.parse(localStorage.getItem('hearth.protein.v1'))
  state.entries.push({ id: 'seed-1', at: yesterday, protein: 90, label: 'Ayer' })
  localStorage.setItem('hearth.protein.v1', JSON.stringify(state))
}, Date.now() - 24 * HOUR)
await page.reload()
check("yesterday is not in today's total", (await card()).today !== '90 g')
check('and shows how short it fell', (await page.textContent('#proteinDays')).includes('41 g short'), await page.textContent('#proteinDays'))

// ------------------------------------------------------------ three logs, three keys
await page.click('#tabFasting')
await page.click('#eatBtn')
await page.click('#tabCalories')
await page.click('#addFoodBtn')
await page.fill('#entryKcal', '500')
await page.click('#entryForm button[type=submit]')
const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('hearth.')).sort())
check('each tab keeps its own key', JSON.stringify(keys) === '["hearth.calories.v1","hearth.protein.v1","hearth.tab","hearth.v1"]', JSON.stringify(keys))
check('the fasting log is untouched by protein', (await stored(page)).meals.length === 1)

// ------------------------------------------------------------ backup and erase
await page.click('#settingsBtn')
check('the summary counts all three', (await page.textContent('#settingsSummary')).includes('protein'), await page.textContent('#settingsSummary'))
const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')])
const backupPath = await download.path()
if (!(await page.isVisible('#settingsDialog'))) await page.click('#settingsBtn')
await page.click('#clearBtn')
await page.click('#clearBtn')
check('erase clears the protein log too', (await protein()).entries.length === 0 && (await protein()).weightKg === null)
await page.click('#toastAction')
check('undo restores it', (await protein()).entries.length > 0)

await page.click('#settingsBtn')
await page.click('#clearBtn')
await page.click('#clearBtn')
await page.click('#settingsBtn')
await page.setInputFiles('#importInput', backupPath)
await page.waitForTimeout(400)
check('the backup brings the protein log back', (await protein()).entries.length > 0, await page.textContent('#toastText'))

check('no console errors', errors.filter((e) => !e.includes('ERR_INTERNET_DISCONNECTED')).length === 0, errors.join(' | '))

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
