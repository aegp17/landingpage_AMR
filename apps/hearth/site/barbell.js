import { onLanguageChange, t } from './i18n.js'
import {
  BARS,
  PLATES,
  barOf,
  changeCount,
  clearPlates,
  countOf,
  defaultBarbellState,
  fits,
  formatPlate,
  freeMm,
  normalizeBarbellState,
  plateOf,
  setBar,
  sidePlates,
  sideSummary,
  toKg,
  totalLb,
  usedMm,
} from './plates.js'
import { toast } from './ui.js'

const STORAGE_KEY = 'hearth.barbell.v1'
const SVG_NS = 'http://www.w3.org/2000/svg'
const VIEW_W = 700
const VIEW_H = 196
const EDGE_PAD = 60
const COLLAR_MM = 30

const $ = (id) => document.getElementById(id)

const el = {
  totalLb: $('barTotalLb'),
  totalKg: $('barTotalKg'),
  group: $('barGroup'),
  drawing: $('barDrawing'),
  side: $('barSide'),
  rows: $('plateRows'),
  clear: $('barClear'),
  note: $('barNote'),
}

let state = defaultBarbellState()

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    state = raw ? normalizeBarbellState(JSON.parse(raw)) : defaultBarbellState()
  } catch {
    state = defaultBarbellState()
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

export function render() {
  el.totalLb.textContent = formatPlate(totalLb(state))
  el.totalKg.textContent = t('bar.kg', { n: formatPlate(toKg(totalLb(state))) })
  renderBarOptions()
  drawBarbell()
  const side = sideSummary(state)
  el.side.textContent = side.length === 0 ? t('bar.perSideEmpty') : t('bar.perSide', { list: side.join(' + ') })
  renderPlateRows()
  el.note.dataset.warn = 'false'
  el.note.textContent = sidePlates(state).length === 0 ? t('bar.empty') : t('bar.free', { n: formatPlate(freeMm(state)) })
}

function renderBarOptions() {
  el.group.replaceChildren(
    ...BARS.map((bar) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('role', 'radio')
      button.setAttribute('aria-checked', String(bar.id === state.bar))
      button.dataset.bar = bar.id
      button.textContent = t(`bar.bar${bar.id}`)
      button.addEventListener('click', () => update(setBar(state, bar.id)))
      return button
    }),
  )
}

function rect(x, y, w, h, fill, rx = 0) {
  const node = document.createElementNS(SVG_NS, 'rect')
  node.setAttribute('x', x.toFixed(2))
  node.setAttribute('y', y.toFixed(2))
  node.setAttribute('width', Math.max(0, w).toFixed(2))
  node.setAttribute('height', Math.max(0, h).toFixed(2))
  if (rx) node.setAttribute('rx', String(rx))
  node.setAttribute('fill', fill)
  return node
}

function gradients() {
  const defs = document.createElementNS(SVG_NS, 'defs')
  const make = (id, stops) => {
    const gradient = document.createElementNS(SVG_NS, 'linearGradient')
    gradient.setAttribute('id', id)
    gradient.setAttribute('x1', '0')
    gradient.setAttribute('y1', '0')
    gradient.setAttribute('x2', '0')
    gradient.setAttribute('y2', '1')
    for (const [offset, color] of stops) {
      const stop = document.createElementNS(SVG_NS, 'stop')
      stop.setAttribute('offset', offset)
      stop.setAttribute('stop-color', color)
      gradient.append(stop)
    }
    defs.append(gradient)
  }
  make('barSteel', [
    ['0', '#d7dbe0'],
    ['0.45', '#9aa1a9'],
    ['1', '#6d737a'],
  ])
  make('barCollar', [
    ['0', '#b9bfc6'],
    ['1', '#5d646b'],
  ])
  make('barSheen', [
    ['0', 'rgba(255,255,255,.28)'],
    ['0.5', 'rgba(255,255,255,0)'],
    ['1', 'rgba(0,0,0,.22)'],
  ])
  return defs
}

function drawBarbell() {
  const bar = barOf(state)
  const scale = (VIEW_W - EDGE_PAD) / bar.lengthMm
  const cx = VIEW_W / 2
  const cy = VIEW_H / 2
  const shaftH = Math.max(3, bar.shaftMm * scale)
  const sleeveH = Math.max(5, bar.sleeveMm * scale)
  const halfLen = (bar.lengthMm * scale) / 2
  const sleeveLen = (bar.loadableMm + COLLAR_MM + 5) * scale
  const side = sidePlates(state)

  const parts = [gradients()]
  parts.push(rect(cx - halfLen + sleeveLen, cy - shaftH / 2, (halfLen - sleeveLen) * 2, shaftH, 'url(#barSteel)', shaftH / 2))
  for (const dir of [-1, 1]) {
    parts.push(rect(cx + dir * 455 * scale - 1, cy - shaftH / 2, 2, shaftH, 'rgba(0,0,0,.35)'))
    const outer = cx + dir * halfLen
    const inner = outer - dir * sleeveLen
    parts.push(rect(Math.min(outer, inner), cy - sleeveH / 2, sleeveLen, sleeveH, 'url(#barSteel)', 2))
    const collarX = dir === 1 ? inner : inner - COLLAR_MM * scale
    parts.push(rect(collarX, cy - sleeveH * 0.85, Math.max(3, COLLAR_MM * scale), sleeveH * 1.7, 'url(#barCollar)', 2))

    let cursor = COLLAR_MM * scale
    for (const lb of side) {
      const plate = plateOf(lb)
      const w = Math.max(2, plate.widthMm * scale)
      const h = plate.diameterMm * scale
      const innerX = cx + dir * (halfLen - sleeveLen + cursor)
      const x = dir === 1 ? innerX : innerX - w
      const rx = plate.kind === 'bumper' ? Math.min(6, w / 2) : Math.min(3, w / 2)
      parts.push(rect(x, cy - h / 2, w, h, plate.color, rx))
      if (plate.kind === 'bumper') parts.push(rect(x, cy - (h * 0.23) / 2, w, h * 0.23, 'rgba(210,214,219,.95)', 1))
      parts.push(rect(x, cy - h / 2, w, h, 'url(#barSheen)', rx))
      cursor += plate.widthMm * scale
    }
  }

  el.drawing.replaceChildren(...parts)
  el.drawing.setAttribute('aria-label', t('bar.ariaDrawing', { bar: formatPlate(bar.lb), n: side.length }))
}

function renderPlateRows() {
  el.rows.replaceChildren(
    ...PLATES.map((plate) => {
      const count = countOf(state, plate.lb)
      const row = document.createElement('div')
      row.className = `plate-row${count ? ' loaded' : ''}`
      row.dataset.plate = String(plate.lb)

      const swatch = document.createElement('span')
      swatch.className = 'plate-swatch'
      swatch.style.background = plate.color
      swatch.append(document.createElement('i'))

      const label = document.createElement('span')
      label.className = 'plate-label'
      label.textContent = t('bar.plate', { n: formatPlate(plate.lb) })

      const minus = document.createElement('button')
      minus.type = 'button'
      minus.className = 'step'
      minus.dataset.minus = String(plate.lb)
      minus.textContent = '−'
      minus.disabled = count === 0
      minus.setAttribute('aria-label', t('bar.remove', { n: formatPlate(plate.lb) }))
      minus.addEventListener('click', () => update(changeCount(state, plate.lb, -1)))

      const value = document.createElement('span')
      value.className = 'plate-count'
      value.dataset.count = String(plate.lb)
      value.textContent = String(count)

      const plus = document.createElement('button')
      plus.type = 'button'
      plus.className = 'step'
      plus.dataset.plus = String(plate.lb)
      plus.textContent = '+'
      plus.disabled = !fits(state, plate.lb)
      plus.setAttribute('aria-label', t('bar.add', { n: formatPlate(plate.lb) }))
      plus.addEventListener('click', () => {
        if (!fits(state, plate.lb)) {
          el.note.dataset.warn = 'true'
          el.note.textContent = t('bar.full')
          return
        }
        update(changeCount(state, plate.lb, 1))
      })

      row.append(swatch, label, minus, value, plus)
      return row
    }),
  )
}

el.clear.addEventListener('click', () => update(clearPlates(state)))

export function barbellBackup() {
  return { bar: state.bar, counts: state.counts }
}

export function importBarbell(data) {
  if (!data) return
  const incoming = normalizeBarbellState(data)
  if (sidePlates(state).length === 0) update(incoming)
}

export function eraseBarbell() {
  update(defaultBarbellState())
}

export function loadedWeight() {
  return usedMm(state) > 0 ? totalLb(state) : null
}

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  load()
  render()
})

onLanguageChange(render)

load()
render()
