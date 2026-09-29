// The app follows the device's language, and lets you override it.
//   node apps/hearth/test/browser/language.mjs
import { HOUR, PHONE, launchChromium, reporter, seed, site, state } from './harness.mjs'

const { check, finish } = reporter()
const server = site()
await server.ready()
const browser = await launchChromium()

async function open(locale, { saved = null } = {}) {
  const context = await browser.newContext({ ...PHONE, locale, acceptDownloads: true })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(server.appUrl)
  if (saved) {
    await seed(page, saved)
    await page.reload()
  }
  await page.waitForLoadState('networkidle')
  return { context, page, errors }
}

const tabs = (page) => page.$$eval('.tabs .tab', (nodes) => nodes.map((n) => n.textContent.trim()))

// ------------------------------------------------------------ a Spanish phone
{
  const { context, page, errors } = await open('es-EC', { saved: state({ meals: [{ at: Date.now() - 9.5 * HOUR }] }) })
  check('the page declares Spanish', (await page.getAttribute('html', 'lang')) === 'es')
  check('the tabs are in Spanish', JSON.stringify(await tabs(page)) === '["Ayuno","Calorías","Proteína"]', JSON.stringify(await tabs(page)))
  check('the button says "Ya comí"', (await page.textContent('#eatBtn')).trim() === 'Ya comí')
  check('the clock label too', (await page.textContent('#clockLabel')) === 'horas de ayuno')
  check('and the stage message', (await page.textContent('#stage')) === 'Vas firme y tranquilo.', await page.textContent('#stage'))
  check('the goal chip is Spanish, hours included', (await page.textContent('#goalBtn')).startsWith('Meta 16 h'), await page.textContent('#goalBtn'))
  check('the stats are labelled in Spanish', (await page.textContent('.stats')).includes('Ayuno más largo'))
  check('the greeting is Spanish', ['Buenos días', 'Buenas tardes', 'Buenas noches'].includes(await page.textContent('#greeting')), await page.textContent('#greeting'))
  const since = await page.textContent('#since')
  check('dates read as Spanish', /^Última comida · (Hoy|Ayer) a las /.test(since), since)

  await page.click('#eatBtn')
  check('toasts are Spanish', (await page.textContent('#toastText')).startsWith('Registrada a las'), await page.textContent('#toastText'))
  check('and so is the undo button', (await page.textContent('#toastAction')) === 'Deshacer')

  await page.click('#tabCalories')
  check('the calories card is Spanish', (await page.textContent('#budgetLabel')) === 'Sin objetivo', await page.textContent('#budgetLabel'))
  check('its parts too', (await page.textContent('.budget-parts')).includes('Objetivo') && (await page.textContent('.budget-parts')).includes('Quemado'))
  await page.click('#addFoodBtn')
  check('the food dialog is Spanish', (await page.textContent('#entryTitle')) === 'Agregar comida')
  check('the meal is named in Spanish', ['Desayuno', 'Almuerzo', 'Cena', 'Snack'].includes(await page.inputValue('#entryLabel')), await page.inputValue('#entryLabel'))
  await page.fill('#foodSearch', 'arroz')
  await page.waitForTimeout(300)
  const firstFood = await page.textContent('#foodResults .food-result:first-child .food-result-name strong')
  check('foods are named in Spanish', firstFood === 'Arroz blanco, cocido', firstFood)
  check('and priced in Spanish', (await page.textContent('#foodResults .food-result:first-child .food-result-name span')) === '130 kcal por 100 g')
  await page.click('#entryDialog [data-close]')

  await page.click('#tabProtein')
  check('the protein tab is Spanish', (await page.textContent('#proteinLabel')) === 'Sin meta', await page.textContent('#proteinLabel'))
  await page.click('#proteinGoalBtn')
  check('its goal dialog too', (await page.textContent('#proteinGoalTitle')) === 'Meta de proteína')
  await page.click('#proteinGoalDialog [data-close]')

  await page.click('#settingsBtn')
  check('settings are Spanish', (await page.textContent('#settingsTitle')) === 'Ajustes')
  check('and the summary counts in Spanish', (await page.textContent('#settingsSummary')).includes('comida'), await page.textContent('#settingsSummary'))
  check('no console errors', errors.length === 0, errors.join(' | '))
  await context.close()
}

// ------------------------------------------------------------ an English phone
{
  const { context, page } = await open('en-US')
  check('English stays English', JSON.stringify(await tabs(page)) === '["Fasting","Calories","Protein"]', JSON.stringify(await tabs(page)))
  check('the page declares English', (await page.getAttribute('html', 'lang')) === 'en')
  check('the button says "I ate"', (await page.textContent('#eatBtn')).trim() === 'I ate')
  await context.close()
}

// ------------------------------------------------------------ a language we do not have
{
  const { context, page } = await open('fr-FR')
  check('an unknown language falls back to English', (await page.textContent('#eatBtn')).trim() === 'I ate', await page.textContent('#eatBtn'))
  await context.close()
}

// ------------------------------------------------------------ choosing by hand
{
  const { context, page, errors } = await open('en-US')
  await page.click('#settingsBtn')
  check('settings offer the language', (await page.textContent('#languageRow')).includes('Language'))
  check('and say it is following the device', (await page.textContent('#languageRowHint')) === 'Now following your device.', await page.textContent('#languageRowHint'))
  await page.click('#languageRow')
  check('the language dialog opens with three options', (await page.$$('#languageList .row-btn')).length === 3)
  check('following the device is the one selected', (await page.getAttribute('#languageList .row-btn:first-child', 'aria-checked')) === 'true')

  await page.click('#languageList [data-language="es"]')
  check('the app switches without a reload', (await page.textContent('#languageTitle')) === 'Idioma', await page.textContent('#languageTitle'))
  check('it says so', (await page.textContent('#toastText')) === 'Hearth ya está en español.', await page.textContent('#toastText'))
  await page.click('#languageDialog [data-close]')
  check('the screen behind it changed too', (await page.textContent('#eatBtn')).trim() === 'Ya comí')
  check('and the page declares Spanish now', (await page.getAttribute('html', 'lang')) === 'es')

  await page.reload()
  check('the choice survives a reload, over the device', (await page.textContent('#eatBtn')).trim() === 'Ya comí')
  check('and is remembered', (await page.evaluate(() => localStorage.getItem('hearth.lang'))) === 'es')

  await page.click('#settingsBtn')
  check('settings say the language is fixed', (await page.textContent('#languageRowHint')) === 'Fijado en Español.', await page.textContent('#languageRowHint'))
  await page.click('#languageRow')
  await page.click('#languageList [data-language="auto"]')
  check('going back to the device returns to English', (await page.textContent('#languageTitle')) === 'Language', await page.textContent('#languageTitle'))
  check('and forgets the choice', (await page.evaluate(() => localStorage.getItem('hearth.lang'))) === null)
  check('no console errors', errors.length === 0, errors.join(' | '))
  await context.close()
}

// ------------------------------------------------------------ the logs do not change
{
  const mealAt = Date.now() - 3 * HOUR
  const { context, page } = await open('es-EC', { saved: state({ meals: [{ at: mealAt }] }) })
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('hearth.v1')))
  check('a Spanish phone stores the same data', stored.meals[0].at === mealAt)
  await page.click('#settingsBtn')
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')])
  check('and the backup file keeps its English shape', download.suggestedFilename().startsWith('hearth-backup-'), download.suggestedFilename())
  await context.close()
}

await browser.close()
server.close()
process.exit(finish() ? 1 : 0)
