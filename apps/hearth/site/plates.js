import { locale } from './i18n.js'

export const LB_TO_KG = 0.45359237
export const BARBELL_STATE_VERSION = 1

export const BARS = [
  { id: '45', lb: 45, lengthMm: 2200, shaftMm: 28, sleeveMm: 50, loadableMm: 415 },
  { id: '35', lb: 35, lengthMm: 2010, shaftMm: 25, sleeveMm: 50, loadableMm: 320 },
]

export const PLATES = [
  { lb: 45, diameterMm: 450, widthMm: 61, color: '#1b4f9c', kind: 'bumper' },
  { lb: 35, diameterMm: 450, widthMm: 48.3, color: '#e3c117', kind: 'bumper' },
  { lb: 25, diameterMm: 450, widthMm: 38.1, color: '#2c8b4b', kind: 'bumper' },
  { lb: 15, diameterMm: 450, widthMm: 26.4, color: '#22201f', kind: 'bumper' },
  { lb: 10, diameterMm: 450, widthMm: 21.1, color: '#22201f', kind: 'bumper' },
  { lb: 5, diameterMm: 190, widthMm: 11, color: '#8d98a3', kind: 'steel', approxWidth: true },
  { lb: 2.5, diameterMm: 160, widthMm: 8, color: '#8d98a3', kind: 'steel', approxWidth: true },
]

export const MAX_PER_PLATE = 20

const round1 = (value) => Math.round(value * 10) / 10

export function plateOf(lb) {
  return PLATES.find((plate) => plate.lb === lb)
}

export function defaultBarbellState() {
  return { version: BARBELL_STATE_VERSION, bar: BARS[0].id, counts: {} }
}

export function normalizeBarbellState(raw) {
  const base = defaultBarbellState()
  if (!raw || typeof raw !== 'object') return base
  const bar = BARS.some((option) => option.id === raw.bar) ? raw.bar : base.bar
  const counts = {}
  if (raw.counts && typeof raw.counts === 'object') {
    for (const plate of PLATES) {
      const value = raw.counts[plate.lb]
      if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        counts[plate.lb] = Math.min(value, MAX_PER_PLATE)
      }
    }
  }
  return trimToSleeve({ version: BARBELL_STATE_VERSION, bar, counts })
}

export function barOf(state) {
  return BARS.find((bar) => bar.id === state.bar) || BARS[0]
}

export function countOf(state, lb) {
  return state.counts[lb] || 0
}

export function sidePlates(state) {
  const side = []
  for (const plate of PLATES) {
    for (let i = 0; i < countOf(state, plate.lb); i++) side.push(plate.lb)
  }
  return side
}

export function usedMm(state) {
  return round1(sidePlates(state).reduce((total, lb) => total + plateOf(lb).widthMm, 0))
}

export function freeMm(state) {
  return round1(barOf(state).loadableMm - usedMm(state))
}

export function fits(state, lb) {
  return usedMm(state) + plateOf(lb).widthMm <= barOf(state).loadableMm
}

export function totalLb(state) {
  return round1(barOf(state).lb + sidePlates(state).reduce((total, lb) => total + lb, 0) * 2)
}

export function toKg(lb) {
  return round1(lb * LB_TO_KG)
}

export function changeCount(state, lb, delta) {
  if (!plateOf(lb)) throw new RangeError(`Unknown plate: ${lb}`)
  if (delta > 0 && !fits(state, lb)) return state
  const next = Math.min(MAX_PER_PLATE, Math.max(0, countOf(state, lb) + delta))
  const counts = { ...state.counts }
  if (next === 0) delete counts[lb]
  else counts[lb] = next
  return { ...state, counts }
}

export function clearPlates(state) {
  return { ...state, counts: {} }
}

function trimToSleeve(state) {
  let next = state
  while (usedMm(next) > barOf(next).loadableMm) {
    const side = sidePlates(next)
    next = changeCount(next, side[side.length - 1], -1)
  }
  return next
}

export function setBar(state, barId) {
  if (!BARS.some((bar) => bar.id === barId)) throw new RangeError(`Unknown bar: ${barId}`)
  return trimToSleeve({ ...state, bar: barId })
}

export function formatPlate(lb) {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(lb)
}

export function sideSummary(state) {
  return sidePlates(state).map(formatPlate)
}
