// The Calories tab: its own screen, its own storage key, nothing shared with
// the fasting log except the toast and the dialog helpers.
import { formatTime } from './core.js'
import { createPicker, foodName } from './foodpicker.js'
import { foodById, loadFoods } from './foods.js'
import { onLanguageChange, t } from './i18n.js'
import {
  ACTIVITIES,
  WEEKLY_GOALS,
  addEntry,
  dayBudget,
  daySummaries,
  defaultCalorieState,
  foodKcal,
  emptyProfile,
  entriesOfDay,
  formatKcal,
  itemsTotal,
  makeEntry,
  mealNameFor,
  normalizeCalorieState,
  plan,
  removeEntry,
  setProfile,
  setTargetOverride,
  validateProfile,
} from './nutrition.js'
import { closeDialog, openDialog, toast } from './ui.js'

const STORAGE_KEY = 'hearth.calories.v1'
const $ = (id) => document.getElementById(id)

const el = {
  panel: $('caloriesTab'),
  budgetLabel: $('budgetLabel'),
  budgetValue: $('budgetValue'),
  budgetUnit: $('budgetUnit'),
  meterFill: $('meterFill'),
  partTarget: $('partTarget'),
  partFood: $('partFood'),
  partExercise: $('partExercise'),
  numbersBtn: $('numbersBtn'),
  addFoodBtn: $('addFoodBtn'),
  addExerciseBtn: $('addExerciseBtn'),
  entryList: $('entryList'),
  entriesEmpty: $('entriesEmpty'),
  daysList: $('daysList'),
  daysEmpty: $('daysEmpty'),
  entryDialog: $('entryDialog'),
  entryForm: $('entryForm'),
  entryTitle: $('entryTitle'),
  entryHint: $('entryHint'),
  entryKcal: $('entryKcal'),
  entryLabel: $('entryLabel'),
  entryError: $('entryError'),
  entrySave: $('entrySave'),
  numbersDialog: $('numbersDialog'),
  numbersForm: $('numbersForm'),
  sexGroup: $('sexGroup'),
  ageInput: $('ageInput'),
  heightInput: $('heightInput'),
  weightInput: $('weightInput'),
  activitySelect: $('activitySelect'),
  goalSelect: $('goalSelect'),
  overrideInput: $('overrideInput'),
  planBox: $('planBox'),
  activityHint: $('activityHint'),
  numbersError: $('numbersError'),
  foodPicker: $('foodPicker'),
  manualField: $('manualField'),
  kcalLabel: $('kcalLabel'),
  entryLabelCaption: $('entryLabelCaption'),
}

// What someone is putting together right now, before they save the meal.
let draftItems = []

let state = defaultCalorieState()
let draftSex = 'female'
let entryKind = 'food'

// ---------------------------------------------------------------- storage

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    state = raw ? normalizeCalorieState(JSON.parse(raw)) : defaultCalorieState()
  } catch {
    // A log we cannot read is parked, never overwritten in silence.
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) localStorage.setItem(`${STORAGE_KEY}.unreadable.${Date.now()}`, raw)
    } catch {
      /* nothing else we can do */
    }
    state = defaultCalorieState()
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    toast(t('storage.refused'))
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
  const budget = dayBudget(state, now)

  if (budget.target == null) {
    el.budgetLabel.textContent = t('cal.noTarget')
    el.budgetValue.textContent = budget.food ? formatKcal(budget.food) : t('cal.setUp')
    el.budgetUnit.textContent = budget.food ? t('cal.eatenToday') : t('cal.setUpUnit')
    el.meterFill.style.width = '0%'
    el.panel.classList.remove('over')
  } else {
    el.budgetLabel.textContent = budget.over ? t('cal.over') : t('cal.left')
    el.budgetValue.textContent = formatKcal(Math.abs(budget.remaining))
    el.budgetUnit.textContent = t('cal.unit')
    el.meterFill.style.width = `${Math.min(100, Math.max(0, budget.fraction * 100))}%`
    el.panel.classList.toggle('over', budget.over)
  }

  el.partTarget.textContent = budget.target == null ? '–' : formatKcal(budget.target)
  el.partFood.textContent = formatKcal(budget.food)
  el.partExercise.textContent = formatKcal(budget.exercise)
  el.numbersBtn.textContent = state.profile || state.targetOverride != null ? t('cal.numbersBtn') : t('cal.numbersBtnEmpty')

  renderEntries(now)
  renderDays(now)
}

function renderEntries(now) {
  const today = entriesOfDay(state.entries, now).slice().reverse()
  const rows = today.map((item) => {
    const row = document.createElement('div')
    row.className = `meal entry ${item.kind}`

    const dot = document.createElement('span')
    dot.className = 'meal-dot'

    const text = document.createElement('div')
    text.className = 'meal-text'
    const title = document.createElement('p')
    title.className = 'meal-time'
    title.textContent = item.kind === 'exercise' ? t('cal.kcalPlus', { n: formatKcal(item.kcal) }) : t('cal.kcal', { n: formatKcal(item.kcal) })
    const sub = document.createElement('p')
    sub.className = 'meal-gap'
    const parts = [item.label, (item.items || []).map((i) => `${foodName(foodById(i.foodId), i.name)} ${i.grams} g`).join(', '), formatTime(item.at)]
    sub.textContent = parts.filter(Boolean).join(' · ')
    text.append(title, sub)

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'meal-delete'
    remove.setAttribute('aria-label', t('cal.deleteEntry', { what: item.label || t(item.kind === 'food' ? 'cal.addFood' : 'cal.addExercise'), time: formatTime(item.at) }))
    remove.append(crossIcon())
    remove.addEventListener('click', () => deleteEntry(item))

    row.append(dot, text, remove)
    return row
  })
  el.entryList.replaceChildren(...rows)
  el.entriesEmpty.hidden = rows.length > 0
}

function renderDays(now) {
  const days = daySummaries(state, now).filter((day) => day.label !== 'Today')
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
    sub.textContent = day.exercise
      ? t('cal.dayEatenBurned', { eaten: formatKcal(day.food), burned: formatKcal(day.exercise) })
      : t('cal.dayEaten', { n: formatKcal(day.food) })
    text.append(title, sub)

    const badge = document.createElement('span')
    badge.className = `badge ${day.difference == null ? '' : day.difference <= 0 ? 'under' : 'over'}`
    badge.textContent =
      day.difference == null
        ? t('cal.dayNet', { n: formatKcal(day.net) })
        : day.difference <= 0
          ? t('cal.dayUnder', { n: formatKcal(-day.difference) })
          : t('cal.dayOver', { n: formatKcal(day.difference) })

    row.append(text, badge)
    return row
  })
  el.daysList.replaceChildren(...rows)
  el.daysEmpty.hidden = rows.length > 0
}

function crossIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M7 7l10 10M17 7L7 17')
  svg.append(path)
  return svg
}

// ---------------------------------------------------------------- food picker

const picker = createPicker({
  container: el.foodPicker,
  prefix: 'food',
  valueOf: (food, grams) => foodKcal(food, grams),
  format: (value) => t('cal.kcal', { n: formatKcal(value) }),
  per100: (food) => t('cal.per100', { n: formatKcal(food.kcal100) }),
  get emptyHint() {
    return t('cal.tableFailed')
  },
  history: () => state.entries,
  onChange(items, total) {
    draftItems = items
    // With foods chosen, the total is the number; typing one would fight it.
    el.manualField.hidden = items.length > 0
    el.entrySave.textContent = items.length ? t('cal.addTotal', { n: formatKcal(total) }) : t('cal.addFoodTitle')
  },
})

// ---------------------------------------------------------------- entries

function openEntry(kind) {
  entryKind = kind
  const food = kind === 'food'
  draftItems = []
  el.entryTitle.textContent = food ? t('cal.addFoodTitle') : t('cal.addExerciseTitle')
  el.entryHint.textContent = food ? t('cal.addFoodHint') : t('cal.addExerciseHint')
  el.entryLabelCaption.textContent = food ? t('cal.mealName') : t('cal.whatWasIt')
  el.entryLabel.placeholder = food ? t('cal.mealPlaceholder') : t('cal.exercisePlaceholder')
  el.entryLabel.value = food ? mealNameFor(new Date()) : ''
  el.entryKcal.value = ''
  el.entryError.textContent = ''
  el.foodPicker.hidden = !food
  picker.reset()
  el.manualField.hidden = false
  el.kcalLabel.textContent = food ? t('cal.orCalories') : t('cal.calories')
  el.entrySave.textContent = food ? t('cal.addFoodTitle') : t('cal.addExerciseTitle')
  openDialog(el.entryDialog)
  if (food) picker.focus()
  else el.entryKcal.focus()
}

function deleteEntry(item) {
  update(removeEntry(state, item.id))
  toast(t('cal.removed', { n: formatKcal(item.kcal) }), t('common.undo'), () => update(addEntry(state, item)))
}

el.addFoodBtn.addEventListener('click', () => openEntry('food'))
el.addExerciseBtn.addEventListener('click', () => openEntry('exercise'))

el.entryForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const items = entryKind === 'food' ? draftItems : []
  const kcal = items.length ? itemsTotal(items) : Number(el.entryKcal.value)
  if (!Number.isFinite(kcal) || kcal < 1 || kcal > 10000) {
    el.entryError.textContent = items.length ? t('cal.tooMuch') : t('cal.badNumber')
    return
  }
  const entry = { ...makeEntry({ at: Date.now(), kcal, kind: entryKind, label: el.entryLabel.value }), ...(items.length ? { items } : {}) }
  closeDialog(el.entryDialog)
  update(addEntry(state, entry))
  const budget = dayBudget(state, Date.now())
  toast(
    budget.remaining == null
      ? t('cal.logged', { n: formatKcal(entry.kcal) })
      : budget.over
        ? t('cal.loggedOver', { n: formatKcal(-budget.remaining) })
        : t('cal.loggedLeft', { n: formatKcal(budget.remaining) }),
    t('common.undo'),
    () => update(removeEntry(state, entry.id)),
  )
})

// ---------------------------------------------------------------- your numbers

function fillNumbers() {
  const profile = state.profile || emptyProfile()
  draftSex = profile.sex
  el.ageInput.value = profile.age ?? ''
  el.heightInput.value = profile.heightCm ?? ''
  el.weightInput.value = profile.weightKg ?? ''
  el.activitySelect.value = profile.activity
  el.goalSelect.value = String(profile.weeklyKg)
  el.overrideInput.value = state.targetOverride ?? ''
  el.numbersError.textContent = ''
  renderSexGroup()
  renderPlan()
}

function renderSexGroup() {
  for (const button of el.sexGroup.querySelectorAll('button')) {
    button.setAttribute('aria-checked', String(button.dataset.sex === draftSex))
  }
}

function draftProfile() {
  return {
    sex: draftSex,
    age: el.ageInput.value === '' ? null : Number(el.ageInput.value),
    heightCm: el.heightInput.value === '' ? null : Number(el.heightInput.value),
    weightKg: el.weightInput.value === '' ? null : Number(el.weightInput.value),
    activity: el.activitySelect.value,
    weeklyKg: Number(el.goalSelect.value),
  }
}

// The estimate updates as they type, so the numbers feel like theirs.
function renderActivityHint() {
  const activity = ACTIVITIES.find((a) => a.key === el.activitySelect.value)
  el.activityHint.textContent = activity ? activity.hint : ''
}

function renderPlan() {
  renderActivityHint()
  const profile = draftProfile()
  if (!validateProfile(profile).ok) {
    el.planBox.replaceChildren(document.createTextNode(t('numbers.fillFirst')))
    return
  }
  const result = plan(profile)
  const rows = [
    [t('numbers.maintenance'), t('cal.kcal', { n: formatKcal(result.maintenance) })],
    [t('numbers.deficit'), result.dailyDeficit ? `−${t('cal.kcal', { n: formatKcal(result.dailyDeficit) })}` : t('numbers.none')],
    [t('numbers.suggested'), t('cal.kcal', { n: formatKcal(result.target) })],
  ]
  const list = rows.map(([label, value]) => {
    const row = document.createElement('div')
    row.className = 'plan-row'
    const key = document.createElement('span')
    key.textContent = label
    const amount = document.createElement('strong')
    amount.textContent = value
    row.append(key, amount)
    return row
  })
  if (result.clamped) {
    const warning = document.createElement('p')
    warning.className = 'plan-warning'
    warning.textContent = t('numbers.clamped', { n: formatKcal(result.floor) })
    list.push(warning)
  }
  el.planBox.replaceChildren(...list)
}

el.numbersBtn.addEventListener('click', () => {
  fillNumbers()
  openDialog(el.numbersDialog)
})

el.sexGroup.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-sex]')
  if (!button) return
  draftSex = button.dataset.sex
  renderSexGroup()
  renderPlan()
})

for (const input of [el.ageInput, el.heightInput, el.weightInput, el.activitySelect, el.goalSelect]) {
  input.addEventListener('input', renderPlan)
}

el.numbersForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const profile = draftProfile()
  const { ok, errors } = validateProfile(profile)
  const override = el.overrideInput.value === '' ? null : Number(el.overrideInput.value)
  if (!ok) {
    el.numbersError.textContent = errors.age || errors.heightCm || errors.weightKg || errors.sex || errors.activity || errors.weeklyKg
    return
  }
  if (override != null && (!Number.isFinite(override) || override < 800 || override > 10000)) {
    el.numbersError.textContent = t('numbers.ownRange')
    return
  }
  closeDialog(el.numbersDialog)
  update(setTargetOverride(setProfile(state, profile), override))
  toast(t('numbers.saved', { n: formatKcal(dayBudget(state, Date.now()).target) }))
})

// ---------------------------------------------------------------- backup

export function calorieBackup() {
  return { profile: state.profile, targetOverride: state.targetOverride, entries: state.entries }
}

// Adds what the file has without deleting anything already here.
export function importCalories(data) {
  const incoming = normalizeCalorieState(data)
  const known = new Set(state.entries.map((e) => e.id))
  const added = incoming.entries.filter((e) => !known.has(e.id))
  update({
    ...state,
    profile: state.profile || incoming.profile,
    targetOverride: state.targetOverride ?? incoming.targetOverride,
    entries: [...state.entries, ...added].sort((a, b) => a.at - b.at),
  })
  return added.length
}

// "Erase everything" in Settings clears this tab too, profile included.
export function eraseCalories() {
  update(defaultCalorieState())
}

export function entryCount() {
  return state.entries.length
}

// Another tab of the app changed the log.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  load()
  render()
})

// The pickers are built from the tables in nutrition.js, so they cannot drift.
for (const activity of ACTIVITIES) {
  const option = document.createElement('option')
  option.value = activity.key
  option.textContent = activity.label
  el.activitySelect.append(option)
}
for (const goal of WEEKLY_GOALS) {
  const option = document.createElement('option')
  option.value = String(goal)
  option.textContent = goal === 0 ? t('numbers.keepWeight') : t('numbers.lose', { n: goal })
  el.goalSelect.append(option)
}

// A language change relabels the selects and redraws the screen.
onLanguageChange(() => {
  for (const option of el.activitySelect.options) {
    const activity = ACTIVITIES.find((a) => a.key === option.value)
    if (activity) option.textContent = activity.label
  }
  for (const option of el.goalSelect.options) {
    const goal = Number(option.value)
    option.textContent = goal === 0 ? t('numbers.keepWeight') : t('numbers.lose', { n: goal })
  }
  render()
})

load()
render()
loadFoods()
