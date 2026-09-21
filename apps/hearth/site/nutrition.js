// Pure logic for the Calories tab: no DOM, no storage.
// Covered by apps/hearth/test/nutrition.test.mjs.
import { dayKey, dayLabel } from './core.js'

export const CALORIE_STATE_VERSION = 1
export const KCAL_PER_KG = 7700

// Mifflin-St Jeor, the formula clinical calculators use. Everything here is an
// estimate for one healthy adult, not advice.
export const ACTIVITIES = [
  { key: 'sedentary', factor: 1.2, label: 'Mostly sitting', hint: 'Desk work, little walking' },
  { key: 'light', factor: 1.375, label: 'Lightly active', hint: 'Light exercise 1–3 days a week' },
  { key: 'moderate', factor: 1.55, label: 'Moderately active', hint: 'Exercise 3–5 days a week' },
  { key: 'active', factor: 1.725, label: 'Very active', hint: 'Hard exercise 6–7 days a week' },
  { key: 'intense', factor: 1.9, label: 'Extremely active', hint: 'Physical job or two sessions a day' },
]

// Kilograms per week. 0 keeps your weight.
export const WEEKLY_GOALS = [0, 0.25, 0.5, 0.75, 1]

// Nobody should be steered below these, whatever the arithmetic says.
export const FLOORS = { female: 1200, male: 1500 }

export const LIMITS = {
  age: { min: 14, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 300 },
  entryKcal: { min: 1, max: 10000 },
}

export function emptyProfile() {
  return { sex: 'female', age: null, heightCm: null, weightKg: null, activity: 'light', weeklyKg: 0.5 }
}

export function defaultCalorieState() {
  return { version: CALORIE_STATE_VERSION, profile: null, targetOverride: null, entries: [] }
}

const isNumber = (value, { min, max }) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

// Field by field, so the form can point at what is wrong.
export function validateProfile(profile) {
  const errors = {}
  if (profile?.sex !== 'female' && profile?.sex !== 'male') errors.sex = 'Pick one.'
  if (!isNumber(profile?.age, LIMITS.age)) errors.age = `Age between ${LIMITS.age.min} and ${LIMITS.age.max}.`
  if (!isNumber(profile?.heightCm, LIMITS.heightCm)) errors.heightCm = `Height between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.`
  if (!isNumber(profile?.weightKg, LIMITS.weightKg)) errors.weightKg = `Weight between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`
  if (!ACTIVITIES.some((a) => a.key === profile?.activity)) errors.activity = 'Pick one.'
  if (!WEEKLY_GOALS.includes(profile?.weeklyKg)) errors.weeklyKg = 'Pick one.'
  return { ok: Object.keys(errors).length === 0, errors }
}

export function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null
  const profile = {
    sex: raw.sex === 'male' ? 'male' : 'female',
    age: raw.age,
    heightCm: raw.heightCm,
    weightKg: raw.weightKg,
    activity: ACTIVITIES.some((a) => a.key === raw.activity) ? raw.activity : 'light',
    weeklyKg: WEEKLY_GOALS.includes(raw.weeklyKg) ? raw.weeklyKg : 0.5,
  }
  return validateProfile(profile).ok ? profile : null
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.id === 'string' &&
    typeof entry.at === 'number' &&
    Number.isInteger(entry.at) &&
    entry.at > 0 &&
    (entry.kind === 'food' || entry.kind === 'exercise') &&
    isNumber(entry.kcal, LIMITS.entryKcal)
  )
}

export function normalizeCalorieState(raw) {
  const base = defaultCalorieState()
  if (!raw || typeof raw !== 'object') return base
  const entries = Array.isArray(raw.entries) ? raw.entries.filter(isValidEntry) : []
  const seen = new Set()
  return {
    version: CALORIE_STATE_VERSION,
    profile: normalizeProfile(raw.profile),
    targetOverride: isNumber(raw.targetOverride, { min: 800, max: 10000 }) ? Math.round(raw.targetOverride) : null,
    entries: entries
      .filter((e) => (seen.has(e.id) ? false : seen.add(e.id)))
      .map((e) => ({ id: e.id, at: e.at, kind: e.kind, kcal: Math.round(e.kcal), label: typeof e.label === 'string' ? e.label.slice(0, 60) : '' }))
      .sort((a, b) => a.at - b.at),
  }
}

export function bmr(profile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return Math.round(profile.sex === 'male' ? base + 5 : base - 161)
}

export function tdee(profile) {
  const factor = ACTIVITIES.find((a) => a.key === profile.activity).factor
  return Math.round(bmr(profile) * factor)
}

// The suggested day: maintenance minus the deficit the weekly goal implies,
// never below the floor for that sex. `clamped` lets the UI say so out loud.
export function plan(profile) {
  const maintenance = tdee(profile)
  const dailyDeficit = Math.round((profile.weeklyKg * KCAL_PER_KG) / 7)
  const raw = maintenance - dailyDeficit
  const floor = FLOORS[profile.sex]
  const target = Math.max(floor, Math.round(raw / 10) * 10)
  return { bmr: bmr(profile), maintenance, dailyDeficit, target, floor, clamped: raw < floor }
}

// The number the day is measured against: your own, or the suggested one.
export function targetFor(state) {
  if (state.targetOverride != null) return state.targetOverride
  return state.profile ? plan(state.profile).target : null
}

export function makeEntry({ at, kcal, kind, label = '' }) {
  return { id: `${at}-${Math.random().toString(36).slice(2, 8)}`, at, kind, kcal: Math.round(kcal), label: label.trim().slice(0, 60) }
}

export function addEntry(state, entry) {
  if (!isValidEntry(entry)) throw new TypeError('Invalid entry')
  return { ...state, entries: [...state.entries, entry].sort((a, b) => a.at - b.at) }
}

export function removeEntry(state, id) {
  return { ...state, entries: state.entries.filter((e) => e.id !== id) }
}

export function setProfile(state, profile) {
  const { ok } = validateProfile(profile)
  if (!ok) throw new TypeError('Invalid profile')
  return { ...state, profile: { ...profile } }
}

export function setTargetOverride(state, target) {
  if (target == null) return { ...state, targetOverride: null }
  if (!isNumber(target, { min: 800, max: 10000 })) throw new RangeError('Target out of range')
  return { ...state, targetOverride: Math.round(target) }
}

export function entriesOfDay(entries, now) {
  const key = dayKey(now)
  return entries.filter((e) => dayKey(e.at) === key)
}

// Exercise gives calories back, which is what makes the budget move both ways.
export function dayTotals(entries, now) {
  const today = entriesOfDay(entries, now)
  const sum = (kind) => today.filter((e) => e.kind === kind).reduce((total, e) => total + e.kcal, 0)
  return { food: sum('food'), exercise: sum('exercise'), count: today.length }
}

export function dayBudget(state, now) {
  const target = targetFor(state)
  const { food, exercise, count } = dayTotals(state.entries, now)
  if (target == null) return { target: null, food, exercise, count, remaining: null, over: false, fraction: 0 }
  const allowance = target + exercise
  const remaining = allowance - food
  return { target, food, exercise, count, remaining, over: remaining < 0, fraction: allowance > 0 ? food / allowance : 0 }
}

// Newest first, one row per day that has entries.
export function daySummaries(state, now, limit = 7) {
  const target = targetFor(state)
  const byDay = new Map()
  for (const entry of state.entries) {
    const key = dayKey(entry.at)
    if (!byDay.has(key)) byDay.set(key, { key, at: entry.at, food: 0, exercise: 0 })
    const day = byDay.get(key)
    day[entry.kind] += entry.kcal
    day.at = Math.max(day.at, entry.at)
  }
  return [...byDay.values()]
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((day) => ({
      ...day,
      label: dayLabel(day.at, now),
      net: day.food - day.exercise,
      difference: target == null ? null : day.food - day.exercise - target,
    }))
}

export function formatKcal(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}
