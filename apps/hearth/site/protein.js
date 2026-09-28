// The Protein tab: its own log, its own storage key, its own goal. It shares
// the food table and the picker with the Calories tab, and nothing else.
import { formatTime } from './core.js'
import { createPicker } from './foodpicker.js'
import { loadFoods } from './foods.js'
import {
  PROTEIN_LIMITS,
  PROTEIN_PER_KG,
  addProteinEntry,
  defaultProteinState,
  entriesOfDay,
  foodProtein,
  formatGrams,
  makeProteinEntry,
  mealNameFor,
  normalizeProteinState,
  proteinDay,
  proteinDaySummaries,
  proteinTarget,
  removeProteinEntry,
  setProteinGoal,
} from './nutrition.js'
import { closeDialog, openDialog, toast } from './ui.js'

const STORAGE_KEY = 'hearth.protein.v1'
const $ = (id) => document.getElementById(id)
const SVG_NS = 'http://www.w3.org/2000/svg'

const el = {
  panel: $('proteinTab'),
  label: $('proteinLabel'),
  value: $('proteinValue'),
  unit: $('proteinUnit'),
  meter: $('proteinMeter'),
  partGoal: $('proteinPartGoal'),
  partToday: $('proteinPartToday'),
  partLeft: $('proteinPartLeft'),
  goalBtn: $('proteinGoalBtn'),
  addBtn: $('addProteinBtn'),
  list: $('proteinList'),
  empty: $('proteinEmpty'),
  days: $('proteinDays'),
  daysEmpty: $('proteinDaysEmpty'),
  dialog: $('proteinDialog'),
  form: $('proteinForm'),
  picker: $('proteinPicker'),
  manualField: $('proteinManualField'),
  grams: $('proteinGrams'),
  mealName: $('proteinMealName'),
  error: $('proteinError'),
  save: $('proteinSave'),
  goalDialog: $('proteinGoalDialog'),
  goalForm: $('proteinGoalForm'),
  weight: $('proteinWeight'),
  perKg: $('proteinPerKg'),
  perKgHint: $('perKgHint'),
  plan: $('proteinPlan'),
  targetInput: $('proteinTargetInput'),
  goalError: $('proteinGoalError'),
}
let state = defaultProteinState()
let draftItems = []

// ---------------------------------------------------------------- storage

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    state = raw ? normalizeProteinState(JSON.parse(raw)) : defaultProteinState()
  } catch {
    // A log we cannot read is parked, never overwritten in silence.
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) localStorage.setItem(`${STORAGE_KEY}.unreadable.${Date.now()}`, raw)
    } catch {
      /* nothing else we can do */
    }
    state = defaultProteinState()
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    toast("This browser isn't letting Hearth save.")
  }
}

function update(next) {
  state = next
  save()
  render()
}

// ---------------------------------------------------------------- rendering

export function render() {
  const now = Date.now()
  const day = proteinDay(state, now)

  if (day.target == null) {
    el.label.textContent = day.total ? 'Protein today' : 'No goal yet'
    el.value.textContent = day.total ? formatGrams(day.total).replace(' g', '') : 'Set up'
    el.unit.textContent = day.total ? 'g eaten today' : 'your goal'
    el.meter.style.width = '0%'
  } else {
    el.label.textContent = day.over ? 'Goal reached' : 'Protein today'
    el.value.textContent = formatGrams(day.total).replace(' g', '')
    el.unit.textContent = `of ${day.target} g`
    el.meter.style.width = `${Math.min(100, Math.max(0, day.fraction * 100))}%`
  }
  el.panel.classList.toggle('done', day.over)

  el.partGoal.textContent = day.target == null ? '–' : `${day.target} g`
  el.partToday.textContent = formatGrams(day.total)
  el.partLeft.textContent = day.remaining == null ? '–' : day.remaining > 0 ? formatGrams(day.remaining) : 'Done'
  el.goalBtn.textContent = proteinTarget(state) == null ? 'Set your goal' : 'Your goal'

  renderEntries(now)
  renderDays(now)
}

function renderEntries(now) {
  const today = entriesOfDay(state.entries, now).slice().reverse()
  const rows = today.map((entry) => {
    const row = document.createElement('div')
    row.className = 'meal'

    const dot = document.createElement('span')
    dot.className = 'meal-dot'

    const text = document.createElement('div')
    text.className = 'meal-text'
    const title = document.createElement('p')
    title.className = 'meal-time'
    title.textContent = `${formatGrams(entry.protein)} protein`
    const sub = document.createElement('p')
    sub.className = 'meal-gap'
    sub.textContent = [entry.label, formatTime(entry.at)].filter(Boolean).join(' · ')
    text.append(title, sub)

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'meal-delete'
    remove.setAttribute('aria-label', `Delete the meal at ${formatTime(entry.at)}`)
    remove.append(crossIcon())
    remove.addEventListener('click', () => deleteEntry(entry))

    row.append(dot, text, remove)

    // Every food of the meal, with what it contributed: the point of the tab.
    if (entry.items?.length) {
      const wrapper = document.createElement('div')
      wrapper.className = 'meal-breakdown'
      wrapper.append(row)
      for (const item of entry.items) {
        const line = document.createElement('p')
        line.className = 'breakdown-line'
        const name = document.createElement('span')
        name.textContent = `${item.name} · ${item.grams} g`
        const grams = document.createElement('strong')
        grams.textContent = formatGrams(item.protein || 0)
        line.append(name, grams)
        wrapper.append(line)
      }
      return wrapper
    }
    return row
  })
  el.list.replaceChildren(...rows)
  el.empty.hidden = rows.length > 0
}

function renderDays(now) {
  const days = proteinDaySummaries(state, now).filter((day) => day.label !== 'Today')
  const rows = days.map((day) => {
    const row = document.createElement('div')
    row.className = 'meal'

    const text = document.createElement('div')
    text.className = 'meal-text'
    const title = document.createElement('p')
    title.className = 'meal-time'
    title.textContent = day.label
    const sub = document.createElement('p')
    sub.className = 'meal-gap'
    sub.textContent = `${formatGrams(day.total)} of protein`
    text.append(title, sub)

    const badge = document.createElement('span')
    badge.className = `badge ${day.difference == null ? '' : day.difference >= 0 ? 'under' : 'over'}`
    badge.textContent =
      day.difference == null ? formatGrams(day.total) : day.difference >= 0 ? 'Goal reached' : `${formatGrams(-day.difference)} short`

    row.append(text, badge)
    return row
  })
  el.days.replaceChildren(...rows)
  el.daysEmpty.hidden = rows.length > 0
}

function crossIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', 'M7 7l10 10M17 7L7 17')
  svg.append(path)
  return svg
}

// ---------------------------------------------------------------- the meal

const picker = createPicker({
  container: el.picker,
  prefix: 'protein',
  valueOf: (food, grams) => foodProtein(food, grams),
  format: (value) => formatGrams(value),
  per100: (food) => `${formatGrams(food.protein100)} protein per 100 g`,
  emptyHint: 'The food table could not load. Type the grams of protein instead.',
  history: () => state.entries,
  onChange(items, total) {
    draftItems = items
    el.manualField.hidden = items.length > 0
    el.save.textContent = items.length ? `Add ${formatGrams(total)}` : 'Add meal'
  },
})

el.addBtn.addEventListener('click', () => {
  draftItems = []
  picker.reset()
  el.grams.value = ''
  el.mealName.value = mealNameFor(new Date())
  el.error.textContent = ''
  el.manualField.hidden = false
  el.save.textContent = 'Add meal'
  openDialog(el.dialog)
  picker.focus()
})

el.form.addEventListener('submit', (event) => {
  event.preventDefault()
  const items = draftItems
  const typed = Number(el.grams.value)
  const protein = items.length ? undefined : typed
  if (!items.length && (!Number.isFinite(typed) || typed < PROTEIN_LIMITS.entryGrams.min || typed > PROTEIN_LIMITS.entryGrams.max)) {
    el.error.textContent = `Pick a food above, or enter between ${PROTEIN_LIMITS.entryGrams.min} and ${PROTEIN_LIMITS.entryGrams.max} g.`
    return
  }
  const entry = makeProteinEntry({ at: Date.now(), protein, label: el.mealName.value, items })
  if (entry.protein > PROTEIN_LIMITS.entryGrams.max) {
    el.error.textContent = `That meal adds up to more than ${PROTEIN_LIMITS.entryGrams.max} g. Check the grams.`
    return
  }
  closeDialog(el.dialog)
  update(addProteinEntry(state, entry))
  const day = proteinDay(state, Date.now())
  toast(
    day.target == null
      ? `Logged ${formatGrams(entry.protein)} of protein.`
      : day.over
        ? `Logged. ${formatGrams(day.total)} today — goal reached.`
        : `Logged. ${formatGrams(day.remaining)} to go today.`,
    'Undo',
    () => update(removeProteinEntry(state, entry.id)),
  )
})

function deleteEntry(entry) {
  update(removeProteinEntry(state, entry.id))
  toast(`Removed ${formatGrams(entry.protein)} of protein.`, 'Undo', () => update(addProteinEntry(state, entry)))
}

// ---------------------------------------------------------------- the goal

function draftGoal() {
  return {
    weightKg: el.weight.value === '' ? null : Number(el.weight.value),
    perKg: el.perKg.value === '' ? null : Number(el.perKg.value),
    targetGrams: el.targetInput.value === '' ? null : Number(el.targetInput.value),
  }
}

function renderGoalPreview() {
  const option = PROTEIN_PER_KG.find((item) => item.value === Number(el.perKg.value))
  el.perKgHint.textContent = option ? option.hint : ''
  const { weightKg, perKg } = draftGoal()
  if (weightKg == null || perKg == null || !Number.isFinite(weightKg)) {
    el.plan.replaceChildren(document.createTextNode('Fill your weight to see a suggested goal.'))
    return
  }
  const row = document.createElement('div')
  row.className = 'plan-row'
  const key = document.createElement('span')
  key.textContent = `${weightKg} kg × ${perKg} g`
  const value = document.createElement('strong')
  value.textContent = `${Math.round(weightKg * perKg)} g a day`
  row.append(key, value)
  el.plan.replaceChildren(row)
}

el.goalBtn.addEventListener('click', () => {
  el.weight.value = state.weightKg ?? ''
  el.perKg.value = String(state.perKg ?? 1.6)
  el.targetInput.value = state.targetGrams ?? ''
  el.goalError.textContent = ''
  renderGoalPreview()
  openDialog(el.goalDialog)
})

for (const input of [el.weight, el.perKg, el.targetInput]) input.addEventListener('input', renderGoalPreview)

el.goalForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const { weightKg, perKg, targetGrams } = draftGoal()
  if (targetGrams == null && (weightKg == null || !Number.isFinite(weightKg))) {
    el.goalError.textContent = 'Enter your weight, or a goal of your own.'
    return
  }
  try {
    const next = setProteinGoal(state, { targetGrams, weightKg, perKg })
    if (proteinTarget(next) == null) throw new RangeError('No goal')
    closeDialog(el.goalDialog)
    update(next)
    toast(`Goal set to ${proteinTarget(state)} g of protein a day.`)
  } catch {
    el.goalError.textContent = `A goal must be between ${PROTEIN_LIMITS.target.min} and ${PROTEIN_LIMITS.target.max} g, and a weight between 30 and 300 kg.`
  }
})

// ---------------------------------------------------------------- backup

export function proteinBackup() {
  return { targetGrams: state.targetGrams, weightKg: state.weightKg, perKg: state.perKg, entries: state.entries }
}

// Adds what the file has without deleting anything already here.
export function importProtein(data) {
  const incoming = normalizeProteinState(data)
  const known = new Set(state.entries.map((entry) => entry.id))
  const added = incoming.entries.filter((entry) => !known.has(entry.id))
  update({
    ...state,
    targetGrams: state.targetGrams ?? incoming.targetGrams,
    weightKg: state.weightKg ?? incoming.weightKg,
    perKg: state.perKg ?? incoming.perKg,
    entries: [...state.entries, ...added].sort((a, b) => a.at - b.at),
  })
  return added.length
}

export function eraseProtein() {
  update(defaultProteinState())
}

export function proteinEntryCount() {
  return state.entries.length
}

// Another tab of the app changed the log.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  load()
  render()
})

for (const option of PROTEIN_PER_KG) {
  const node = document.createElement('option')
  node.value = String(option.value)
  node.textContent = `${option.value} g · ${option.label}`
  el.perKg.append(node)
}

load()
render()
loadFoods()
