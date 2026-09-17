// Pure logic for Hearth: no DOM, no storage. Everything here is covered by
// apps/hearth/test/core.test.mjs (run with `node --test apps/hearth/test`).

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export const GOALS = [12, 14, 16, 18, 20, 24]
export const DEFAULT_GOAL = 16
export const STATE_VERSION = 1

const LOCALE = 'en-US'

export function defaultState() {
  return { version: STATE_VERSION, goalHours: DEFAULT_GOAL, meals: [] }
}

function isValidTimestamp(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function sortUnique(timestamps) {
  return [...new Set(timestamps)].sort((a, b) => a - b)
}

// Accepts anything read back from storage and returns a well-formed state.
// Invalid meals are dropped one by one rather than discarding the whole log.
export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const goalHours = GOALS.includes(raw.goalHours) ? raw.goalHours : DEFAULT_GOAL
  const meals = Array.isArray(raw.meals)
    ? sortUnique(raw.meals.map((m) => m && m.at).filter(isValidTimestamp)).map((at) => ({ at }))
    : []
  return { version: STATE_VERSION, goalHours, meals }
}

export function addMeal(state, at) {
  if (!isValidTimestamp(at)) throw new TypeError('Meal time must be a timestamp in milliseconds')
  const meals = sortUnique([...state.meals.map((m) => m.at), at]).map((t) => ({ at: t }))
  return { ...state, meals }
}

export function removeMeal(state, at) {
  return { ...state, meals: state.meals.filter((m) => m.at !== at) }
}

export function setGoal(state, goalHours) {
  if (!GOALS.includes(goalHours)) throw new RangeError(`Unsupported goal: ${goalHours}`)
  return { ...state, goalHours }
}

// Latest meal that is not in the future. A meal "in the future" can only come
// from a device clock that moved backwards; it must not produce a negative fast.
export function lastMealAt(meals, now) {
  for (let i = meals.length - 1; i >= 0; i--) {
    if (meals[i].at <= now) return meals[i].at
  }
  return null
}

export function hasMealInMinute(meals, at) {
  const minute = Math.floor(at / MINUTE)
  return meals.some((m) => Math.floor(m.at / MINUTE) === minute)
}

export function splitDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const pad = (n) => String(n).padStart(2, '0')

// "14:07" and ":09" — hours are not wrapped into days, fasting is counted in hours.
export function formatClock(ms) {
  const { hours, minutes, seconds } = splitDuration(ms)
  return { main: `${hours}:${pad(minutes)}`, seconds: `:${pad(seconds)}` }
}

// "15h 20m", "16h", "45m", "0m"
export function formatDuration(ms) {
  const { hours, minutes } = splitDuration(ms)
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function progress(elapsedMs, goalHours) {
  return Math.max(0, elapsedMs) / (goalHours * HOUR)
}

export function stageFor(fraction) {
  if (fraction >= 1) return 'Goal reached. Beautifully done.'
  if (fraction >= 0.75) return 'Almost there. Keep it cozy.'
  if (fraction >= 0.5) return 'Steady and calm.'
  if (fraction >= 0.25) return 'Settling in nicely.'
  return 'Freshly fed. Enjoy the warmth.'
}

export function greetingFor(date) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 18) return 'Good afternoon'
  if (h >= 18 && h < 22) return 'Good evening'
  return 'Good night'
}

// Local calendar day, so a meal at 23:50 and one at 00:10 land on different days
// regardless of the 24h distance between them (and across DST changes).
export function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function dayLabel(ts, now) {
  const today = new Date(now)
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  const key = dayKey(ts)
  if (key === dayKey(now)) return 'Today'
  if (key === dayKey(yesterday.getTime())) return 'Yesterday'
  const d = new Date(ts)
  const options = { weekday: 'short', month: 'short', day: 'numeric' }
  if (d.getFullYear() !== today.getFullYear()) options.year = 'numeric'
  return new Intl.DateTimeFormat(LOCALE, options).format(d)
}

export function formatTime(ts) {
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' }).format(new Date(ts))
}

// Value for <input type="datetime-local">, which works in local time without offset.
export function toLocalInputValue(ts) {
  const d = new Date(ts)
  return `${dayKey(ts)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function parseLocalInputValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const [datePart, timePart] = value.split('T')
  const [y, mo, d] = datePart.split('-').map(Number)
  const [h, mi] = timePart.split(':').map(Number)
  const date = new Date(y, mo - 1, d, h, mi)
  // new Date rolls invalid parts over (Feb 31 -> Mar 3); reject instead.
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return date.getTime()
}

// ISO 8601 with the device's offset, e.g. 2026-09-17T20:42:00-05:00
export function toLocalIso(ts) {
  const d = new Date(ts)
  const offset = -d.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return `${toLocalInputValue(ts)}:${pad(d.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

// Fasting windows that already ended: the gap between each pair of meals.
export function completedFasts(meals) {
  const out = []
  for (let i = 1; i < meals.length; i++) {
    out.push({ from: meals[i - 1].at, to: meals[i].at, ms: meals[i].at - meals[i - 1].at })
  }
  return out
}

export function computeStats(meals, now) {
  const fasts = completedFasts(meals.filter((m) => m.at <= now))
  const last = lastMealAt(meals, now)
  const currentMs = last == null ? 0 : now - last
  const longestMs = Math.max(currentMs, ...fasts.map((f) => f.ms), 0)
  const recent = fasts.filter((f) => f.to > now - 7 * DAY)
  const averageMs = recent.length ? recent.reduce((sum, f) => sum + f.ms, 0) / recent.length : null
  return { longestMs, averageMs, mealCount: meals.length }
}

// Newest first, grouped by local day. `gapMs` is the fast that ended with that meal.
export function historyGroups(meals, now, limit = Infinity) {
  const groups = []
  const start = Math.max(0, meals.length - limit)
  for (let i = meals.length - 1; i >= start; i--) {
    const at = meals[i].at
    const key = dayKey(at)
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = { key, label: dayLabel(at, now), items: [] }
      groups.push(group)
    }
    group.items.push({ at, gapMs: i > 0 ? at - meals[i - 1].at : null })
  }
  return groups
}

export function toBackup(state, now) {
  return {
    app: 'hearth',
    version: STATE_VERSION,
    exportedAt: toLocalIso(now),
    goalHours: state.goalHours,
    meals: state.meals.map((m) => ({ at: m.at, local: toLocalIso(m.at) })),
  }
}

// Throws with a user-facing message when the file is not a Hearth backup.
export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("That file isn't valid JSON.")
  }
  if (!data || data.app !== 'hearth' || !Array.isArray(data.meals)) {
    throw new Error("That file isn't a Hearth backup.")
  }
  const bad = data.meals.filter((m) => !m || !isValidTimestamp(m.at))
  if (bad.length) {
    throw new Error(`The backup has ${bad.length} unreadable ${bad.length === 1 ? 'entry' : 'entries'}. Nothing was imported.`)
  }
  return normalizeState(data)
}

// Keeps the current goal; returns how many meals were actually new.
export function mergeMeals(state, imported) {
  const before = new Set(state.meals.map((m) => m.at))
  const added = imported.meals.filter((m) => !before.has(m.at)).length
  const meals = sortUnique([...before, ...imported.meals.map((m) => m.at)]).map((at) => ({ at }))
  return { state: { ...state, meals }, added }
}

// "Version 1a2b3c4 · Sep 17, 2026", or a plain label when running unstamped.
export function formatBuild(build) {
  if (!build || !/^[0-9a-f]{7,40}$/.test(build.id)) return 'Development build'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(build.date || '')
  if (!match) return `Version ${build.id}`
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const label = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
  return `Version ${build.id} · ${label}`
}
