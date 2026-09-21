// The Calories tab: its own screen, its own storage key, nothing shared with
// the fasting log except the toast and the dialog helpers.
import { formatTime } from './core.js'
import {
  ACTIVITIES,
  WEEKLY_GOALS,
  addEntry,
  dayBudget,
  daySummaries,
  defaultCalorieState,
  emptyProfile,
  entriesOfDay,
  formatKcal,
  makeEntry,
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
}

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
  const budget = dayBudget(state, now)

  if (budget.target == null) {
    el.budgetLabel.textContent = 'No target yet'
    el.budgetValue.textContent = budget.food ? formatKcal(budget.food) : 'Set up'
    el.budgetUnit.textContent = budget.food ? 'kcal eaten today' : 'your numbers'
    el.meterFill.style.width = '0%'
    el.panel.classList.remove('over')
  } else {
    el.budgetLabel.textContent = budget.over ? 'Over by' : 'Left today'
    el.budgetValue.textContent = formatKcal(Math.abs(budget.remaining))
    el.budgetUnit.textContent = 'kcal'
    el.meterFill.style.width = `${Math.min(100, Math.max(0, budget.fraction * 100))}%`
    el.panel.classList.toggle('over', budget.over)
  }

  el.partTarget.textContent = budget.target == null ? '–' : formatKcal(budget.target)
  el.partFood.textContent = formatKcal(budget.food)
  el.partExercise.textContent = formatKcal(budget.exercise)
  el.numbersBtn.textContent = state.profile || state.targetOverride != null ? 'Your numbers' : 'Set up your numbers'

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
    title.textContent = `${item.kind === 'exercise' ? '+' : ''}${formatKcal(item.kcal)} kcal`
    const sub = document.createElement('p')
    sub.className = 'meal-gap'
    sub.textContent = item.label ? `${item.label} · ${formatTime(item.at)}` : formatTime(item.at)
    text.append(title, sub)

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'meal-delete'
    remove.setAttribute('aria-label', `Delete ${item.label || item.kind} at ${formatTime(item.at)}`)
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
    sub.textContent = `${formatKcal(day.food)} eaten${day.exercise ? `, ${formatKcal(day.exercise)} burned` : ''}`
    text.append(title, sub)

    const badge = document.createElement('span')
    badge.className = `badge ${day.difference == null ? '' : day.difference <= 0 ? 'under' : 'over'}`
    badge.textContent =
      day.difference == null
        ? `${formatKcal(day.net)} net`
        : day.difference <= 0
          ? `${formatKcal(-day.difference)} under`
          : `${formatKcal(day.difference)} over`

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

// ---------------------------------------------------------------- entries

function openEntry(kind) {
  entryKind = kind
  el.entryTitle.textContent = kind === 'food' ? 'Add food' : 'Add exercise'
  el.entryHint.textContent =
    kind === 'food' ? 'What you ate, in calories.' : 'What you burned, from your watch or the machine. It goes back into the day.'
  el.entryLabel.placeholder = kind === 'food' ? 'Lunch, coffee, a snack…' : 'Run, gym, walk…'
  el.entryKcal.value = ''
  el.entryLabel.value = ''
  el.entryError.textContent = ''
  el.entrySave.textContent = kind === 'food' ? 'Add food' : 'Add exercise'
  openDialog(el.entryDialog)
  el.entryKcal.focus()
}

function deleteEntry(item) {
  update(removeEntry(state, item.id))
  toast(`Removed ${formatKcal(item.kcal)} kcal.`, 'Undo', () => update(addEntry(state, item)))
}

el.addFoodBtn.addEventListener('click', () => openEntry('food'))
el.addExerciseBtn.addEventListener('click', () => openEntry('exercise'))

el.entryForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const kcal = Number(el.entryKcal.value)
  if (!Number.isFinite(kcal) || kcal < 1 || kcal > 10000) {
    el.entryError.textContent = 'Enter a number between 1 and 10,000.'
    return
  }
  const entry = makeEntry({ at: Date.now(), kcal, kind: entryKind, label: el.entryLabel.value })
  closeDialog(el.entryDialog)
  update(addEntry(state, entry))
  const budget = dayBudget(state, Date.now())
  toast(
    budget.remaining == null
      ? `Logged ${formatKcal(entry.kcal)} kcal.`
      : budget.over
        ? `Logged. ${formatKcal(-budget.remaining)} kcal over today.`
        : `Logged. ${formatKcal(budget.remaining)} kcal left today.`,
    'Undo',
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
    el.planBox.replaceChildren(document.createTextNode('Fill your age, height and weight to see an estimate.'))
    return
  }
  const result = plan(profile)
  const rows = [
    ['Burned in a day', `${formatKcal(result.maintenance)} kcal`],
    ['Deficit', result.dailyDeficit ? `−${formatKcal(result.dailyDeficit)} kcal` : 'none'],
    ['Suggested target', `${formatKcal(result.target)} kcal`],
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
    warning.textContent = `That pace would put you under ${formatKcal(result.floor)} kcal a day, so the target stays there.`
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
    el.numbersError.textContent = 'A target of your own must be between 800 and 10,000 kcal.'
    return
  }
  closeDialog(el.numbersDialog)
  update(setTargetOverride(setProfile(state, profile), override))
  toast(`Target set to ${formatKcal(dayBudget(state, Date.now()).target)} kcal a day.`)
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
  option.textContent = goal === 0 ? 'Keep my weight' : `Lose ${goal} kg a week`
  el.goalSelect.append(option)
}

load()
render()
