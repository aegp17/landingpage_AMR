import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as p from '../site/plates.js'
import { setLanguage } from '../site/i18n.js'

const load = (bar, counts) => p.normalizeBarbellState({ bar, counts })

test('the bars carry the IWF measurements', () => {
  const men = p.BARS.find((bar) => bar.id === '45')
  const women = p.BARS.find((bar) => bar.id === '35')
  assert.deepEqual(men, { id: '45', lb: 45, lengthMm: 2200, shaftMm: 28, sleeveMm: 50, loadableMm: 415 })
  assert.deepEqual(women, { id: '35', lb: 35, lengthMm: 2010, shaftMm: 25, sleeveMm: 50, loadableMm: 320 })
})

test('every plate has a real diameter, width and colour', () => {
  assert.deepEqual(p.PLATES.map((plate) => plate.lb), [45, 35, 25, 15, 10, 5, 2.5])
  for (const plate of p.PLATES) {
    assert.ok(plate.diameterMm >= 160 && plate.diameterMm <= 450, `${plate.lb}: ${plate.diameterMm} mm`)
    assert.ok(plate.widthMm > 0 && plate.widthMm <= 70, `${plate.lb}: ${plate.widthMm} mm`)
    assert.match(plate.color, /^#[0-9a-f]{6}$/)
  }
  const bumpers = p.PLATES.filter((plate) => plate.kind === 'bumper')
  assert.ok(bumpers.every((plate) => plate.diameterMm === 450))
  for (let i = 1; i < bumpers.length; i++) {
    assert.ok(bumpers[i].widthMm < bumpers[i - 1].widthMm, 'a lighter bumper is always thinner')
  }
  assert.ok(p.PLATES.filter((plate) => plate.approxWidth).every((plate) => plate.kind === 'steel'))
})

test('the total counts both sides and the bar', () => {
  assert.equal(p.totalLb(p.defaultBarbellState()), 45)
  assert.equal(p.totalLb(load('45', { 45: 1 })), 135)
  assert.equal(p.totalLb(load('45', { 45: 1, 25: 1 })), 185)
  assert.equal(p.totalLb(load('35', { 45: 1, 25: 1 })), 175)
  assert.equal(p.totalLb(load('45', { 2.5: 1 })), 50)
})

test('kilos come from the pounds, rounded to one decimal', () => {
  assert.equal(p.toKg(45), 20.4)
  assert.equal(p.toKg(185), 83.9)
  assert.equal(p.toKg(0), 0)
})

test('plates stack heaviest first, whatever order they went on', () => {
  const state = load('45', { 10: 1, 45: 2, 25: 1 })
  assert.deepEqual(p.sidePlates(state), [45, 45, 25, 10])
})

test('the sleeve has a real limit', () => {
  const bar = p.BARS[0]
  let state = p.defaultBarbellState()
  for (let i = 0; i < 10; i++) state = p.changeCount(state, 45, 1)
  assert.equal(p.countOf(state, 45), 6, '6 plates of 61 mm fit in 415 mm, a seventh does not')
  assert.ok(p.usedMm(state) <= bar.loadableMm)
  assert.equal(p.fits(state, 45), false)
  assert.equal(p.fits(state, 2.5), true)
  assert.equal(p.freeMm(state), 49)

  const refused = p.changeCount(state, 45, 1)
  assert.equal(p.countOf(refused, 45), 6, 'a plate that does not fit changes nothing')
})

test('counts never go below zero and drop out when emptied', () => {
  let state = p.changeCount(p.defaultBarbellState(), 25, 1)
  state = p.changeCount(state, 25, -1)
  assert.deepEqual(state.counts, {})
  assert.deepEqual(p.changeCount(state, 25, -1).counts, {})
  assert.throws(() => p.changeCount(state, 7, 1), RangeError)
})

test('changing the bar drops only what no longer fits, lightest first', () => {
  let state = load('45', { 45: 6 })
  assert.equal(p.usedMm(state), 366)
  state = p.setBar(state, '35')
  assert.equal(p.barOf(state).loadableMm, 320)
  assert.equal(p.countOf(state, 45), 5, '305 mm of plates fit on the 320 mm sleeve')
  assert.ok(p.usedMm(state) <= 320)

  const mixed = p.setBar(load('45', { 45: 5, 2.5: 2 }), '35')
  assert.deepEqual(mixed.counts, { 45: 5, 2.5: 1 })
  assert.throws(() => p.setBar(mixed, '20'), RangeError)
})

test('a stored load is repaired, not trusted', () => {
  const state = p.normalizeBarbellState({ bar: 'nope', counts: { 45: 2, 7: 9, 25: -1, 10: 1.5, 35: '2', 2.5: 999 } })
  assert.equal(state.bar, '45')
  assert.deepEqual(state.counts, { 45: 2, 2.5: 20 }, 'unknown plates, fractions, strings and negatives go')
  assert.deepEqual(p.normalizeBarbellState(null), p.defaultBarbellState())
  assert.deepEqual(p.normalizeBarbellState({ counts: { 45: 99 } }).counts, { 45: 6 }, 'more than the sleeve holds is trimmed')
})

test('clearing leaves the bar chosen', () => {
  const state = p.clearPlates(load('35', { 45: 2 }))
  assert.deepEqual(state.counts, {})
  assert.equal(state.bar, '35')
  assert.equal(p.totalLb(state), 35)
})

test('plate numbers are written in the running language', () => {
  setLanguage('en')
  assert.equal(p.formatPlate(2.5), '2.5')
  assert.equal(p.formatPlate(45), '45')
  setLanguage('es')
  assert.equal(p.formatPlate(2.5), '2,5')
  assert.deepEqual(p.sideSummary(load('45', { 45: 1, 2.5: 1 })), ['45', '2,5'])
  setLanguage('en')
})
