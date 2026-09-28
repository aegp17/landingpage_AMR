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

const round1 = (value) => Math.round(value * 10) / 10

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

export const ITEM_LIMITS = { grams: { min: 1, max: 5000 } }

function isValidItem(item) {
  return (
    item &&
    typeof item.foodId === 'string' &&
    typeof item.name === 'string' &&
    isNumber(item.grams, ITEM_LIMITS.grams) &&
    isNumber(item.kcal, { min: 0, max: LIMITS.entryKcal.max }) &&
    // Protein arrived later; items logged before it simply have none recorded.
    (item.protein === undefined || isNumber(item.protein, { min: 0, max: 5000 }))
  )
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.id === 'string' &&
    typeof entry.at === 'number' &&
    Number.isInteger(entry.at) &&
    entry.at > 0 &&
    (entry.kind === 'food' || entry.kind === 'exercise') &&
    isNumber(entry.kcal, LIMITS.entryKcal) &&
    (entry.items === undefined || (Array.isArray(entry.items) && entry.items.every(isValidItem)))
  )
}

// Repair first, then validate: a meal with one damaged item keeps the rest,
// instead of the whole meal disappearing.
function repairEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  const items = Array.isArray(raw.items)
    ? raw.items.filter(isValidItem).map((i) => ({
        foodId: i.foodId,
        name: String(i.name).slice(0, 60),
        grams: Math.round(i.grams),
        kcal: Math.round(i.kcal),
        ...(i.protein === undefined ? {} : { protein: round1(i.protein) }),
      }))
    : []
  return {
    id: raw.id,
    at: raw.at,
    kind: raw.kind,
    // With items, their sum is the truth: a stored total can never drift from them.
    kcal: items.length ? itemsTotal(items) : Math.round(raw.kcal),
    label: typeof raw.label === 'string' ? raw.label.slice(0, 60) : '',
    ...(items.length ? { items } : {}),
  }
}

export function normalizeCalorieState(raw) {
  const base = defaultCalorieState()
  if (!raw || typeof raw !== 'object') return base
  const seen = new Set()
  const entries = (Array.isArray(raw.entries) ? raw.entries : [])
    .map(repairEntry)
    .filter((entry) => entry && isValidEntry(entry))
    .filter((entry) => (seen.has(entry.id) ? false : seen.add(entry.id)))
    .sort((a, b) => a.at - b.at)
  return {
    version: CALORIE_STATE_VERSION,
    profile: normalizeProfile(raw.profile),
    targetOverride: isNumber(raw.targetOverride, { min: 800, max: 10000 }) ? Math.round(raw.targetOverride) : null,
    entries,
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

// ---------------------------------------------------------------- foods

// Accents and case should never stand between someone and their food: "piña",
// "pina" and "PINA" all have to find the same thing.
export function normalizeText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Name matches first, then aliases; a word that starts a name beats one buried
// in the middle, so "rice" offers rice before "fried rice"-style entries.
export function searchFoods(foods, query, limit = 8) {
  const needle = normalizeText(query)
  if (!needle) return []
  const scored = []
  for (const food of foods) {
    const name = normalizeText(food.name)
    const aliases = (food.aliases || []).map(normalizeText)
    // An exact word beats a prefix, and a prefix beats a match buried inside:
    // typing "arroz" must offer plain rice before "arroz integral".
    let score = null
    if (name === needle) score = 0
    else if (aliases.includes(needle)) score = 1
    else if (name.startsWith(needle)) score = 2
    else if (aliases.some((a) => a.startsWith(needle))) score = 3
    else if (name.split(' ').some((word) => word.startsWith(needle))) score = 4
    else if (name.includes(needle) || aliases.some((a) => a.includes(needle))) score = 5
    if (score != null) scored.push({ food, score })
  }
  return scored
    .sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((hit) => hit.food)
}

export function foodKcal(food, grams) {
  return Math.round((food.kcal100 * grams) / 100)
}

// One decimal: 2.7 g of protein in a plate of rice is not nothing once the day
// is added up, and rounding each item to whole grams drifts.
export function foodProtein(food, grams) {
  return round1(((food.protein100 || 0) * grams) / 100)
}

export function makeItem(food, grams) {
  return {
    foodId: food.id,
    name: food.name,
    grams: Math.round(grams),
    kcal: foodKcal(food, grams),
    protein: foodProtein(food, grams),
  }
}

export function itemsProtein(items) {
  return round1(items.reduce((total, item) => total + (item.protein || 0), 0))
}

// "36 g", "4.3 g": the decimal only earns its place under ten grams.
export function formatGrams(value) {
  const grams = round1(value)
  return `${grams >= 10 ? Math.round(grams) : grams} g`
}

export function itemsTotal(items) {
  return items.reduce((total, item) => total + item.kcal, 0)
}

// A sensible default name for the meal being logged.
export function mealNameFor(date) {
  const hour = date.getHours()
  if (hour >= 4 && hour < 11) return 'Breakfast'
  if (hour >= 11 && hour < 16) return 'Lunch'
  if (hour >= 16 && hour < 22) return 'Dinner'
  return 'Snack'
}

// The foods someone actually logs, newest first, for one tap next time.
export function recentFoods(entries, foods, limit = 6) {
  const byId = new Map(foods.map((food) => [food.id, food]))
  const seen = new Set()
  const out = []
  for (let i = entries.length - 1; i >= 0 && out.length < limit; i--) {
    for (const item of entries[i].items || []) {
      if (seen.has(item.foodId) || !byId.has(item.foodId)) continue
      seen.add(item.foodId)
      out.push(byId.get(item.foodId))
      if (out.length === limit) break
    }
  }
  return out
}

// ---------------------------------------------------------------- protein
//
// Its own log, kept apart from the calorie one: the two tabs are independent,
// and a day of protein is not the same record as a day of calories.

export const PROTEIN_STATE_VERSION = 1
// Grams of protein per kilo of body weight, with what they are usually for.
export const PROTEIN_PER_KG = [
  { value: 0.8, label: 'Basic need', hint: 'What an adult needs to stay healthy' },
  { value: 1.2, label: 'Active', hint: 'Regular training, staying at your weight' },
  { value: 1.6, label: 'Building muscle', hint: 'Strength training, or losing fat' },
  { value: 2.0, label: 'High', hint: 'Hard training with a calorie deficit' },
]
export const PROTEIN_LIMITS = { entryGrams: { min: 1, max: 500 }, target: { min: 20, max: 400 } }

export function defaultProteinState() {
  return { version: PROTEIN_STATE_VERSION, targetGrams: null, weightKg: null, perKg: null, entries: [] }
}

export function makeProteinEntry({ at, protein, label = '', items = [] }) {
  return {
    id: `${at}-${Math.random().toString(36).slice(2, 8)}`,
    at,
    protein: items.length ? itemsProtein(items) : round1(protein),
    label: label.trim().slice(0, 60),
    ...(items.length ? { items } : {}),
  }
}

function isValidProteinEntry(entry) {
  return (
    entry &&
    typeof entry.id === 'string' &&
    Number.isInteger(entry.at) &&
    entry.at > 0 &&
    isNumber(entry.protein, PROTEIN_LIMITS.entryGrams) &&
    (entry.items === undefined || (Array.isArray(entry.items) && entry.items.every(isValidItem)))
  )
}

// Repair first, validate after: one damaged item must not cost the whole meal.
function repairProteinEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  const items = Array.isArray(raw.items)
    ? raw.items.filter(isValidItem).map((i) => ({
        foodId: i.foodId,
        name: String(i.name).slice(0, 60),
        grams: Math.round(i.grams),
        kcal: Math.round(i.kcal),
        protein: round1(i.protein || 0),
      }))
    : []
  return {
    id: raw.id,
    at: raw.at,
    // With items, their sum is the truth.
    protein: items.length ? itemsProtein(items) : round1(raw.protein),
    label: typeof raw.label === 'string' ? raw.label.slice(0, 60) : '',
    ...(items.length ? { items } : {}),
  }
}

export function normalizeProteinState(raw) {
  const base = defaultProteinState()
  if (!raw || typeof raw !== 'object') return base
  const seen = new Set()
  const perKg = PROTEIN_PER_KG.some((option) => option.value === raw.perKg) ? raw.perKg : null
  return {
    version: PROTEIN_STATE_VERSION,
    targetGrams: isNumber(raw.targetGrams, PROTEIN_LIMITS.target) ? Math.round(raw.targetGrams) : null,
    weightKg: isNumber(raw.weightKg, LIMITS.weightKg) ? raw.weightKg : null,
    perKg,
    entries: (Array.isArray(raw.entries) ? raw.entries : [])
      .map(repairProteinEntry)
      .filter((entry) => entry && isValidProteinEntry(entry))
      .filter((entry) => (seen.has(entry.id) ? false : seen.add(entry.id)))
      .sort((a, b) => a.at - b.at),
  }
}

export function addProteinEntry(state, entry) {
  if (!isValidProteinEntry(entry)) throw new TypeError('Invalid protein entry')
  return { ...state, entries: [...state.entries, entry].sort((a, b) => a.at - b.at) }
}

export function removeProteinEntry(state, id) {
  return { ...state, entries: state.entries.filter((entry) => entry.id !== id) }
}

// Either a number of your own, or body weight times grams per kilo.
export function setProteinGoal(state, { targetGrams = null, weightKg = null, perKg = null }) {
  if (targetGrams != null && !isNumber(targetGrams, PROTEIN_LIMITS.target)) throw new RangeError('Target out of range')
  if (weightKg != null && !isNumber(weightKg, LIMITS.weightKg)) throw new RangeError('Weight out of range')
  if (perKg != null && !PROTEIN_PER_KG.some((option) => option.value === perKg)) throw new RangeError('Unsupported grams per kilo')
  return { ...state, targetGrams: targetGrams == null ? null : Math.round(targetGrams), weightKg, perKg }
}

export function proteinTarget(state) {
  if (state.targetGrams != null) return state.targetGrams
  if (state.weightKg != null && state.perKg != null) return Math.round(state.weightKg * state.perKg)
  return null
}

export function proteinDay(state, now) {
  const today = entriesOfDay(state.entries, now)
  const total = round1(today.reduce((sum, entry) => sum + entry.protein, 0))
  const target = proteinTarget(state)
  if (target == null) return { total, target: null, remaining: null, over: false, fraction: 0, count: today.length }
  return {
    total,
    target,
    remaining: round1(target - total),
    over: total >= target,
    fraction: target > 0 ? total / target : 0,
    count: today.length,
  }
}

// Newest first, one row per day that has entries.
export function proteinDaySummaries(state, now, limit = 7) {
  const target = proteinTarget(state)
  const byDay = new Map()
  for (const entry of state.entries) {
    const key = dayKey(entry.at)
    if (!byDay.has(key)) byDay.set(key, { key, at: entry.at, total: 0 })
    const day = byDay.get(key)
    day.total = round1(day.total + entry.protein)
    day.at = Math.max(day.at, entry.at)
  }
  return [...byDay.values()]
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((day) => ({ ...day, label: dayLabel(day.at, now), difference: target == null ? null : round1(day.total - target) }))
}
