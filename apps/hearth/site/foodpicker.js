// Search foods, tap a portion, adjust the grams: the same component for the
// Calories and the Protein tabs. Each tab says what a food is worth to it
// (calories or grams of protein) and gets the items back.
import { ITEM_LIMITS, makeItem, recentFoods, searchFoods } from './nutrition.js'
import { STARTERS, getFoods, onFoodsLoaded } from './foods.js'

const SVG_NS = 'http://www.w3.org/2000/svg'

function crossIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', 'M7 7l10 10M17 7L7 17')
  svg.append(path)
  return svg
}

/**
 * @param container   element the picker fills
 * @param prefix      id prefix, so two pickers can live on one page
 * @param valueOf     (food, grams) -> the number this tab cares about
 * @param format      (value) -> "205 kcal" or "36 g"
 * @param per100      (food) -> "130 kcal per 100 g"
 * @param emptyHint   what to say when the table could not load
 * @param history     () -> the tab's entries, for the recent list
 * @param onChange    (items) -> called whenever the draft changes
 */
export function createPicker({ container, prefix, valueOf, format, per100, emptyHint, history, onChange }) {
  let items = []

  const field = document.createElement('label')
  field.className = 'field'
  const caption = document.createElement('span')
  caption.textContent = 'Add foods'
  const search = document.createElement('input')
  search.type = 'search'
  search.id = `${prefix}Search`
  search.placeholder = 'rice, pollo, banana…'
  search.autocomplete = 'off'
  search.enterKeyHint = 'done'
  field.append(caption, search)

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.id = `${prefix}Hint`

  const results = document.createElement('div')
  results.className = 'food-results'
  results.id = `${prefix}Results`

  const chosen = document.createElement('div')
  chosen.className = 'food-items'
  chosen.id = `${prefix}Items`

  const total = document.createElement('p')
  total.className = 'food-total'
  total.id = `${prefix}Total`
  total.hidden = true

  container.replaceChildren(field, hint, results, chosen, total)

  const defaultGrams = (food) => food.portions[0]?.grams || 100
  const foodOf = (item) => getFoods().find((food) => food.id === item.foodId) || { id: item.foodId, name: item.name, kcal100: 0, protein100: 0, portions: [] }
  const sum = () => items.reduce((acc, item) => acc + valueOf(foodOf(item), item.grams), 0)

  function add(food, grams) {
    items = [...items, makeItem(food, grams)]
    search.value = ''
    renderResults()
    renderItems()
  }

  function renderResults() {
    const foods = getFoods()
    const query = search.value.trim()
    const recent = recentFoods(history(), foods)
    const matches = query ? searchFoods(foods, query) : recent.length ? recent : STARTERS.map((id) => foods.find((f) => f.id === id)).filter(Boolean)

    hint.textContent =
      foods.length === 0
        ? emptyHint
        : query
          ? matches.length === 0
            ? 'Nothing found. Try another word, or type the number below.'
            : ''
          : recent.length
            ? 'Recent'
            : 'Common foods'

    results.replaceChildren(...matches.map(resultRow))
  }

  function resultRow(food) {
    const row = document.createElement('div')
    row.className = 'food-result'

    const pick = document.createElement('button')
    pick.type = 'button'
    pick.className = 'food-result-name'
    const name = document.createElement('strong')
    name.textContent = food.name
    const per = document.createElement('span')
    per.textContent = per100(food)
    pick.append(name, per)
    pick.addEventListener('click', () => add(food, defaultGrams(food)))
    row.append(pick)

    const portions = document.createElement('div')
    portions.className = 'food-portions'
    for (const portion of [...food.portions.slice(0, 2), { label: '100 g', grams: 100 }]) {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'portion-chip'
      chip.textContent = `${portion.label} · ${format(valueOf(food, portion.grams))}`
      chip.setAttribute('aria-label', `Add ${portion.label} of ${food.name}`)
      chip.addEventListener('click', () => add(food, portion.grams))
      portions.append(chip)
    }
    row.append(portions)
    return row
  }

  function renderItems() {
    const rows = items.map((item, index) => {
      const row = document.createElement('div')
      row.className = 'food-item'

      const name = document.createElement('span')
      name.className = 'food-item-name'
      name.textContent = item.name

      const grams = document.createElement('input')
      grams.type = 'number'
      grams.inputMode = 'numeric'
      grams.min = String(ITEM_LIMITS.grams.min)
      grams.max = String(ITEM_LIMITS.grams.max)
      grams.value = String(item.grams)
      grams.setAttribute('aria-label', `Grams of ${item.name}`)

      const unit = document.createElement('span')
      unit.className = 'food-item-unit'
      unit.textContent = 'g'

      const value = document.createElement('span')
      value.className = 'food-item-kcal'
      value.textContent = format(valueOf(foodOf(item), item.grams))

      grams.addEventListener('input', () => {
        const amount = Number(grams.value)
        if (!Number.isFinite(amount) || amount < ITEM_LIMITS.grams.min || amount > ITEM_LIMITS.grams.max) return
        const food = foodOf(item)
        items = items.map((other, i) => (i === index ? makeItem(food, amount) : other))
        value.textContent = format(valueOf(food, amount))
        renderTotal()
      })

      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'meal-delete'
      remove.setAttribute('aria-label', `Remove ${item.name}`)
      remove.append(crossIcon())
      remove.addEventListener('click', () => {
        items = items.filter((_, i) => i !== index)
        renderItems()
        renderResults()
      })

      row.append(name, grams, unit, value, remove)
      return row
    })
    chosen.replaceChildren(...rows)
    renderTotal()
  }

  function renderTotal() {
    total.hidden = items.length === 0
    total.textContent = `Total ${format(sum())}`
    onChange(items, sum())
  }

  search.addEventListener('input', renderResults)
  search.addEventListener('keydown', (event) => {
    // Enter in a search box would submit the meal before anything is picked.
    if (event.key === 'Enter') event.preventDefault()
  })

  onFoodsLoaded(renderResults)

  return {
    get items() {
      return items
    },
    total: sum,
    reset() {
      items = []
      search.value = ''
      renderResults()
      renderItems()
    },
    focus() {
      search.focus()
    },
  }
}
