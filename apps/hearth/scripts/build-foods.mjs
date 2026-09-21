// Builds site/foods.json from USDA FoodData Central (SR Legacy), which is in
// the public domain. Every food is pinned by its FDC id and checked against the
// description it is supposed to have, so a dataset update cannot silently
// change what a food means.
//
//   curl -o /tmp/sr.zip https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
//   unzip -d /tmp/sr /tmp/sr.zip
//   node apps/hearth/scripts/build-foods.mjs /tmp/sr/FoodData_Central_sr_legacy_food_csv_2018-04
//
// Spanish aliases are ours, for searching; the app's own text stays English.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = {
  name: 'USDA FoodData Central, SR Legacy',
  dataset: 'FoodData_Central_sr_legacy_food_csv_2018-04',
  url: 'https://fdc.nal.usda.gov/download-datasets.html',
  note: 'Energy in kcal per 100 g of the edible portion. Public domain.',
}

// [fdcId, slug, display name, category, expected description snippet, Spanish aliases]
const FOODS = [
  [168935, 'white-rice', 'White rice, cooked', 'grains', 'Rice, white, long-grain, regular, cooked', ['arroz', 'arroz blanco']],
  [169704, 'brown-rice', 'Brown rice, cooked', 'grains', 'Rice, brown, long-grain, cooked', ['arroz integral']],
  [169737, 'pasta', 'Pasta, cooked', 'grains', 'Pasta, cooked, enriched', ['fideo', 'tallarin', 'pasta', 'spaghetti']],
  [168917, 'quinoa', 'Quinoa, cooked', 'grains', 'Quinoa, cooked', ['quinua', 'quinoa']],
  [173904, 'oats', 'Oats, dry', 'grains', 'Cereals, oats, regular and quick, not fortified, dry', ['avena']],
  [174648, 'corn-flakes', 'Corn flakes', 'grains', 'Cereals ready-to-eat, RALSTON Corn Flakes', ['hojuelas de maiz', 'cereal']],
  [174924, 'white-bread', 'White bread', 'grains', 'Bread, white, commercially prepared', ['pan', 'pan blanco']],
  [172688, 'wheat-bread', 'Whole-wheat bread', 'grains', 'Bread, whole-wheat, commercially prepared', ['pan integral']],
  [172796, 'burger-bun', 'Hamburger bun', 'grains', 'Rolls, hamburger or hotdog, plain', ['pan de hamburguesa']],
  [175036, 'corn-tortilla', 'Corn tortilla', 'grains', 'Tortillas, ready-to-bake or -fry, corn', ['tortilla de maiz']],
  [175037, 'flour-tortilla', 'Flour tortilla', 'grains', 'Tortillas, ready-to-bake or -fry, flour', ['tortilla de harina']],

  [171477, 'chicken-breast', 'Chicken breast, roasted', 'protein', 'Chicken, broilers or fryers, breast, meat only, cooked, roasted', ['pollo', 'pechuga']],
  [172388, 'chicken-thigh', 'Chicken thigh, roasted', 'protein', 'Chicken, broilers or fryers, thigh, meat only, cooked, roasted', ['muslo de pollo', 'presa']],
  [171798, 'ground-beef', 'Ground beef, cooked', 'protein', 'Beef, ground, 80% lean meat / 20% fat, patty, cooked', ['carne molida', 'res']],
  [168649, 'beef-steak', 'Beef steak, lean', 'protein', 'Beef, round, top round steak, boneless, separable lean only', ['bistec', 'carne', 'churrasco']],
  [168240, 'pork-chop', 'Pork chop, broiled', 'protein', 'Pork, fresh, loin, center loin (chops), bone-in, separable lean only, cooked, broiled', ['chuleta', 'cerdo', 'chancho']],
  [175177, 'tilapia', 'Tilapia, cooked', 'protein', 'Fish, tilapia, cooked, dry heat', ['tilapia', 'pescado']],
  [171956, 'cod', 'White fish (cod), cooked', 'protein', 'Fish, cod, Atlantic, cooked, dry heat', ['pescado blanco', 'corvina', 'bacalao']],
  [175168, 'salmon', 'Salmon, cooked', 'protein', 'Fish, salmon, Atlantic, farmed, cooked', ['salmon']],
  [173709, 'canned-tuna', 'Canned tuna in water', 'protein', 'Fish, tuna, light, canned in water, drained solids', ['atun', 'atun en lata']],
  [171971, 'shrimp', 'Shrimp, cooked', 'protein', 'Crustaceans, shrimp, mixed species, cooked, moist heat', ['camaron', 'camarones']],
  [173424, 'boiled-egg', 'Egg, hard-boiled', 'protein', 'Egg, whole, cooked, hard-boiled', ['huevo', 'huevo cocido', 'huevo duro']],
  [173423, 'fried-egg', 'Egg, fried', 'protein', 'Egg, whole, cooked, fried', ['huevo frito']],

  [171265, 'whole-milk', 'Whole milk', 'dairy', 'Milk, whole, 3.25% milkfat', ['leche', 'leche entera']],
  [171267, 'milk-2', 'Milk, 2%', 'dairy', 'Milk, reduced fat, fluid, 2% milkfat', ['leche semidescremada']],
  [171269, 'skim-milk', 'Skim milk', 'dairy', 'Milk, nonfat, fluid', ['leche descremada']],
  [171284, 'plain-yogurt', 'Plain yogurt', 'dairy', 'Yogurt, plain, whole milk', ['yogur', 'yogurt']],
  [170894, 'greek-yogurt', 'Greek yogurt, nonfat', 'dairy', 'Yogurt, Greek, plain, nonfat', ['yogur griego']],
  [172223, 'queso-fresco', 'Queso fresco', 'dairy', 'Cheese, fresh, queso fresco', ['queso fresco', 'queso']],
  [170845, 'mozzarella', 'Mozzarella', 'dairy', 'Cheese, mozzarella, whole milk', ['mozzarella']],
  [170899, 'cheddar', 'Cheddar', 'dairy', 'Cheese, cheddar, sharp, sliced', ['cheddar']],
  [173410, 'butter', 'Butter', 'fats', 'Butter, salted', ['mantequilla']],

  [173735, 'black-beans', 'Black beans, cooked', 'legumes', 'Beans, black, mature seeds, cooked, boiled, without salt', ['frejol negro', 'frijol negro', 'porotos']],
  [175194, 'kidney-beans', 'Red beans, cooked', 'legumes', 'Beans, kidney, red, mature seeds, cooked, boiled, without salt', ['frejol', 'frijol rojo', 'menestra']],
  [172421, 'lentils', 'Lentils, cooked', 'legumes', 'Lentils, mature seeds, cooked, boiled, without salt', ['lenteja', 'lentejas']],
  [173757, 'chickpeas', 'Chickpeas, cooked', 'legumes', 'Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt', ['garbanzo']],

  [170440, 'boiled-potato', 'Potato, boiled', 'vegetables', 'Potatoes, boiled, cooked without skin', ['papa', 'papa cocida']],
  [170698, 'french-fries', 'French fries', 'vegetables', 'Fast foods, potato, french fried in vegetable oil', ['papas fritas']],
  [168483, 'sweet-potato', 'Sweet potato, baked', 'vegetables', 'Sweet potato, cooked, baked in skin', ['camote', 'batata']],
  [169985, 'cassava', 'Cassava (yuca), raw', 'vegetables', 'Cassava, raw', ['yuca']],
  [168216, 'green-plantain', 'Green plantain, boiled', 'vegetables', 'Plantains, green, boiled', ['verde', 'platano verde', 'bolon']],
  [168199, 'fried-plantain', 'Green plantain, fried', 'vegetables', 'Plantains, green, fried', ['patacon', 'chifle', 'tostones']],
  [169131, 'ripe-plantain', 'Ripe plantain, baked', 'vegetables', 'Plantains, yellow, baked', ['maduro', 'platano maduro']],
  [169999, 'corn', 'Sweet corn, boiled', 'vegetables', 'Corn, sweet, yellow, cooked, boiled', ['choclo', 'maiz']],
  [170457, 'tomato', 'Tomato, raw', 'vegetables', 'Tomatoes, red, ripe, raw', ['tomate']],
  [169247, 'lettuce', 'Romaine lettuce', 'vegetables', 'Lettuce, cos or romaine, raw', ['lechuga']],
  [170379, 'broccoli', 'Broccoli, raw', 'vegetables', 'Broccoli, raw', ['brocoli']],
  [170393, 'carrot', 'Carrot, raw', 'vegetables', 'Carrots, raw', ['zanahoria']],
  [168409, 'cucumber', 'Cucumber', 'vegetables', 'Cucumber, with peel, raw', ['pepino']],
  [170000, 'onion', 'Onion, raw', 'vegetables', 'Onions, raw', ['cebolla']],
  [170108, 'bell-pepper', 'Red bell pepper', 'vegetables', 'Peppers, sweet, red, raw', ['pimiento']],
  [168462, 'spinach', 'Spinach, raw', 'vegetables', 'Spinach, raw', ['espinaca']],
  [171705, 'avocado', 'Avocado', 'vegetables', 'Avocados, raw, all commercial varieties', ['aguacate', 'palta']],

  [173944, 'banana', 'Banana', 'fruit', 'Bananas, raw', ['banana', 'guineo', 'platano']],
  [171688, 'apple', 'Apple', 'fruit', 'Apples, raw, with skin', ['manzana']],
  [169097, 'orange', 'Orange', 'fruit', 'Oranges, raw, all commercial varieties', ['naranja']],
  [169926, 'papaya', 'Papaya', 'fruit', 'Papayas, raw', ['papaya']],
  [169124, 'pineapple', 'Pineapple', 'fruit', 'Pineapple, raw, all varieties', ['piña', 'pina']],
  [169910, 'mango', 'Mango', 'fruit', 'Mangos, raw', ['mango']],
  [167762, 'strawberry', 'Strawberries', 'fruit', 'Strawberries, raw', ['frutilla', 'fresa']],
  [167765, 'watermelon', 'Watermelon', 'fruit', 'Watermelon, raw', ['sandia']],
  [174683, 'grapes', 'Grapes', 'fruit', 'Grapes, red or green', ['uva', 'uvas']],

  [171413, 'olive-oil', 'Olive oil', 'fats', 'Oil, olive, salad or cooking', ['aceite de oliva']],
  [171411, 'vegetable-oil', 'Vegetable oil', 'fats', 'Oil, soybean, salad or cooking', ['aceite']],
  [171009, 'mayonnaise', 'Mayonnaise', 'fats', 'Salad dressing, mayonnaise, regular', ['mayonesa']],
  [172470, 'peanut-butter', 'Peanut butter', 'fats', 'Peanut butter, smooth style', ['mantequilla de mani']],
  [173806, 'peanuts', 'Peanuts, roasted', 'fats', 'Peanuts, all types, dry-roasted', ['mani']],
  [170158, 'almonds', 'Almonds', 'fats', 'Nuts, almonds, dry roasted', ['almendra', 'almendras']],
  [170187, 'walnuts', 'Walnuts', 'fats', 'Nuts, walnuts, english', ['nuez', 'nueces']],

  [169655, 'sugar', 'Sugar', 'sweets', 'Sugars, granulated', ['azucar']],
  [169640, 'honey', 'Honey', 'sweets', 'Honey', ['miel']],
  [170274, 'dark-chocolate', 'Dark chocolate', 'sweets', 'Candies, chocolate, dark', ['chocolate negro']],
  [167587, 'milk-chocolate', 'Milk chocolate', 'sweets', 'Candies, milk chocolate', ['chocolate']],
  [167575, 'ice-cream', 'Vanilla ice cream', 'sweets', 'Ice creams, vanilla', ['helado']],
  [172716, 'cookies', 'Chocolate chip cookies', 'sweets', 'Cookies, chocolate chip, commercially prepared', ['galletas']],
  [169677, 'potato-chips', 'Potato chips', 'snacks', 'Snacks, potato chips, plain, salted', ['papas fritas de funda', 'chips']],
  [167959, 'popcorn', 'Popcorn, air-popped', 'snacks', 'Snacks, popcorn, air-popped', ['canguil', 'palomitas']],

  [174852, 'cola', 'Cola', 'drinks', 'Beverages, carbonated, cola, regular', ['cola', 'gaseosa']],
  [169098, 'orange-juice', 'Orange juice', 'drinks', 'Orange juice, raw', ['jugo de naranja']],
  [171890, 'coffee', 'Black coffee', 'drinks', 'Beverages, coffee, brewed, prepared with tap water', ['cafe']],
  [173227, 'tea', 'Black tea', 'drinks', 'Beverages, tea, black, brewed, prepared with tap water', ['te']],
  [168746, 'beer', 'Beer', 'drinks', 'Alcoholic beverage, beer, regular, all', ['cerveza']],
  [173190, 'red-wine', 'Red wine', 'drinks', 'Alcoholic beverage, wine, table, red', ['vino', 'vino tinto']],

  [170317, 'pizza', 'Cheese pizza', 'prepared', 'Pizza, cheese topping, regular crust', ['pizza']],
  [170693, 'hamburger', 'Hamburger, plain', 'prepared', 'Fast foods, hamburger; single, regular patty; plain', ['hamburguesa']],
]

// Household measures worth offering, most useful first; anything else is noise
// on a phone. Matched against the modifier with its parenthetical notes removed.
const PORTION_PATTERNS = [
  /^cup\b/i,
  /^(slice|sandwich|fillet|breast|thigh|fruit|egg|bun|roll|tortilla|cookie|ear|piece|patty)\b/i,
  /^(large|medium|small|extra small)\b/i,
  /^(tbsp|tablespoon|tsp|teaspoon)\b/i,
  /^(container|bottle|can|glass)\b/i,
  /^(oz|serving|NLEA serving|unit|package|scoop|bar)\b/i,
]

// "cup, chopped (about 3 oz)" -> "cup chopped"; "serving 9 servings per 24 oz
// package" -> "serving". Long tails read badly in a picker.
function tidyModifier(raw) {
  const plain = raw
    .replace(/\([^)]*\)/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const short = plain.replace(/\b(\d[\d./]*\s*)?servings? per .*/i, '').replace(/\bnot packed\b|\bpacked\b/i, '').trim()
  const words = short.split(' ').slice(0, 3)
  // Drop tails that read as cut-off phrases: "cup chopped or", "roll 1 serving".
  while (words.length > 1 && /^(or|and|with|without|in|per|the|\d+(\.\d+)?)$/i.test(words.at(-1))) words.pop()
  return words.join(' ')
}

function portionsFor(fdcId) {
  const rows = portionsByFood.get(String(fdcId)) || []
  const out = []
  for (const pattern of PORTION_PATTERNS) {
    for (const row of rows) {
      const modifier = tidyModifier(row.modifier || row.portion_description || '')
      const grams = Math.round(Number(row.gram_weight))
      const amount = Number(row.amount) || 1
      if (!modifier || !pattern.test(modifier) || !(grams >= 5 && grams <= 500)) continue
      const label = `${amount} ${modifier}`
      if (out.some((p) => p.label === label || p.grams === grams)) continue
      out.push({ label, grams })
      if (out.length === 3) return out
    }
  }
  return out
}

function parseCsv(path) {
  const text = readFileSync(path, 'utf8')
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (char !== '\r') field += char
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const header = rows.shift()
  return rows.filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node build-foods.mjs <path to the SR Legacy csv folder>')
  process.exit(1)
}

const descriptions = new Map(parseCsv(join(dir, 'food.csv')).map((r) => [r.fdc_id, r.description]))
const energy = new Map()
for (const row of parseCsv(join(dir, 'food_nutrient.csv'))) {
  if (row.nutrient_id === '1008') energy.set(row.fdc_id, Number(row.amount))
}
const portionsByFood = new Map()
for (const row of parseCsv(join(dir, 'food_portion.csv'))) {
  if (!portionsByFood.has(row.fdc_id)) portionsByFood.set(row.fdc_id, [])
  portionsByFood.get(row.fdc_id).push(row)
}

const foods = []
const problems = []
for (const [fdcId, id, name, category, expected, aliases] of FOODS) {
  const key = String(fdcId)
  const description = descriptions.get(key)
  const kcal = energy.get(key)
  if (!description) problems.push(`${id}: fdc id ${fdcId} is not in this dataset`)
  else if (!description.toLowerCase().startsWith(expected.toLowerCase())) problems.push(`${id}: expected "${expected}…", dataset says "${description}"`)
  else if (!Number.isFinite(kcal)) problems.push(`${id}: no energy value`)
  else foods.push({ id, name, category, aliases, kcal100: Math.round(kcal), portions: portionsFor(fdcId), fdcId, usda: description })
}

const ids = new Set()
for (const food of foods) {
  if (ids.has(food.id)) problems.push(`duplicate slug: ${food.id}`)
  ids.add(food.id)
}

if (problems.length) {
  console.error('Refusing to write foods.json:\n- ' + problems.join('\n- '))
  process.exit(1)
}

const out = join(fileURLToPath(new URL('../site/', import.meta.url)), 'foods.json')
writeFileSync(out, JSON.stringify({ source: SOURCE, built: new Date().toISOString().slice(0, 10), foods }, null, 1) + '\n')
console.log(`Wrote ${foods.length} foods to ${out}`)
