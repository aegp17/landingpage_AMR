import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as core from '../site/core.js'

const { HOUR, MINUTE, DAY } = core
// Built with the local constructor so the tests hold in any timezone.
const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime()

test('normalizeState repairs whatever comes back from storage', () => {
  assert.deepEqual(core.normalizeState(null), core.defaultState())
  assert.deepEqual(core.normalizeState('nope'), core.defaultState())
  const repaired = core.normalizeState({
    goalHours: 15,
    meals: [{ at: 300 }, null, { at: 'x' }, { at: 100 }, { at: 300 }, { at: 1.5 }, { at: -4 }],
  })
  assert.equal(repaired.goalHours, core.DEFAULT_GOAL)
  assert.deepEqual(repaired.meals, [{ at: 100 }, { at: 300 }])
})

test('addMeal keeps meals sorted and unique, removeMeal drops only that one', () => {
  let s = core.defaultState()
  s = core.addMeal(s, 500)
  s = core.addMeal(s, 100)
  s = core.addMeal(s, 500)
  assert.deepEqual(s.meals, [{ at: 100 }, { at: 500 }])
  assert.deepEqual(core.removeMeal(s, 100).meals, [{ at: 500 }])
  assert.throws(() => core.addMeal(s, NaN), TypeError)
})

test('addMeal does not mutate the previous state (undo relies on it)', () => {
  const s = core.addMeal(core.defaultState(), 100)
  core.addMeal(s, 200)
  assert.deepEqual(s.meals, [{ at: 100 }])
})

test('setGoal only accepts the offered goals', () => {
  assert.equal(core.setGoal(core.defaultState(), 18).goalHours, 18)
  assert.throws(() => core.setGoal(core.defaultState(), 17), RangeError)
})

test('lastMealAt ignores meals in the future', () => {
  const meals = [{ at: 100 }, { at: 200 }, { at: 900 }]
  assert.equal(core.lastMealAt(meals, 500), 200)
  assert.equal(core.lastMealAt(meals, 50), null)
  assert.equal(core.lastMealAt([], 50), null)
})

test('hasMealInMinute compares whole minutes', () => {
  const base = at(2026, 9, 17, 20, 42)
  const meals = [{ at: base + 35 * 1000 }]
  assert.equal(core.hasMealInMinute(meals, base), true)
  assert.equal(core.hasMealInMinute(meals, base + MINUTE), false)
})

test('formatClock counts hours past a day and pads minutes and seconds', () => {
  assert.deepEqual(core.formatClock(0), { main: '0:00', seconds: ':00' })
  assert.deepEqual(core.formatClock(14 * HOUR + 7 * MINUTE + 9000), { main: '14:07', seconds: ':09' })
  assert.deepEqual(core.formatClock(50 * HOUR + 999), { main: '50:00', seconds: ':00' })
  assert.deepEqual(core.formatClock(-5000), { main: '0:00', seconds: ':00' })
})

test('formatDuration', () => {
  assert.equal(core.formatDuration(0), '0m')
  assert.equal(core.formatDuration(59 * 1000), '0m')
  assert.equal(core.formatDuration(45 * MINUTE), '45m')
  assert.equal(core.formatDuration(16 * HOUR), '16h')
  assert.equal(core.formatDuration(15 * HOUR + 20 * MINUTE), '15h 20m')
  assert.equal(core.formatDuration(2 * DAY + HOUR), '49h')
})

test('progress and stages', () => {
  assert.equal(core.progress(8 * HOUR, 16), 0.5)
  assert.equal(core.progress(-HOUR, 16), 0)
  assert.equal(core.stageFor(0), 'Freshly fed. Enjoy the warmth.')
  assert.equal(core.stageFor(0.25), 'Settling in nicely.')
  assert.equal(core.stageFor(0.5), 'Steady and calm.')
  assert.equal(core.stageFor(0.99), 'Almost there. Keep it cozy.')
  assert.equal(core.stageFor(1), 'Goal reached. Beautifully done.')
  assert.equal(core.stageFor(3), 'Goal reached. Beautifully done.')
})

test('greetingFor', () => {
  assert.equal(core.greetingFor(new Date(2026, 8, 17, 7)), 'Good morning')
  assert.equal(core.greetingFor(new Date(2026, 8, 17, 12)), 'Good afternoon')
  assert.equal(core.greetingFor(new Date(2026, 8, 17, 19)), 'Good evening')
  assert.equal(core.greetingFor(new Date(2026, 8, 17, 2)), 'Good night')
})

test('dayLabel uses calendar days, not 24h windows', () => {
  const now = at(2026, 9, 17, 0, 10)
  assert.equal(core.dayLabel(at(2026, 9, 17, 0, 1), now), 'Today')
  assert.equal(core.dayLabel(at(2026, 9, 16, 23, 50), now), 'Yesterday')
  assert.equal(core.dayLabel(at(2026, 9, 16, 0, 5), now), 'Yesterday')
  assert.equal(core.dayLabel(at(2026, 9, 15, 23, 59), now), 'Tue, Sep 15')
  assert.equal(core.dayLabel(at(2025, 12, 31, 9), now), 'Wed, Dec 31, 2025')
  // Yesterday across a month boundary
  assert.equal(core.dayLabel(at(2026, 8, 31, 22), at(2026, 9, 1, 8)), 'Yesterday')
})

test('formatTime is in English 12h clock', () => {
  assert.equal(core.formatTime(at(2026, 9, 17, 20, 42)), '8:42 PM')
  assert.equal(core.formatTime(at(2026, 9, 17, 0, 5)), '12:05 AM')
})

test('datetime-local values round-trip and reject impossible dates', () => {
  const ts = at(2026, 9, 17, 8, 5)
  assert.equal(core.toLocalInputValue(ts), '2026-09-17T08:05')
  assert.equal(core.parseLocalInputValue('2026-09-17T08:05'), ts)
  assert.equal(core.parseLocalInputValue('2026-02-31T08:05'), null)
  assert.equal(core.parseLocalInputValue(''), null)
  assert.equal(core.parseLocalInputValue('2026-09-17 08:05'), null)
})

test('toLocalIso carries the device offset and parses back to the same instant', () => {
  const ts = at(2026, 9, 17, 20, 42)
  const iso = core.toLocalIso(ts)
  assert.match(iso, /^2026-09-17T20:42:00[+-]\d{2}:\d{2}$/)
  assert.equal(new Date(iso).getTime(), ts)
})

test('computeStats: longest includes the running fast, average only the last 7 days', () => {
  const now = at(2026, 9, 17, 12)
  const meals = [
    { at: now - 9 * DAY },
    { at: now - 9 * DAY + 20 * HOUR }, // 20h, ended 8 days ago: out of the average
    { at: now - 8 * DAY + 14 * HOUR }, // 18h, ended 7.4 days ago: out of the average
    { at: now - 7 * DAY + 12 * HOUR }, // 22h, ended 6.5 days ago: in
    { at: now - 7 * DAY + 16 * HOUR }, // 4h: in
    { at: now - 5 * HOUR }, // 6 days and 3h since the last log: in, and the longest
  ]
  const stats = core.computeStats(meals, now)
  assert.equal(stats.longestMs, 6 * DAY + 3 * HOUR)
  assert.equal(stats.mealCount, 6)
  assert.equal(stats.averageMs, (22 * HOUR + 4 * HOUR + 6 * DAY + 3 * HOUR) / 3)

  // The running fast counts for "longest" once it beats every completed one.
  assert.equal(core.computeStats(meals.slice(0, 2), now).longestMs, 8 * DAY + 4 * HOUR)
})

test('computeStats with no meals, one meal, and a meal in the future', () => {
  const now = at(2026, 9, 17, 12)
  assert.deepEqual(core.computeStats([], now), { longestMs: 0, averageMs: null, mealCount: 0 })
  assert.deepEqual(core.computeStats([{ at: now - 3 * HOUR }], now), { longestMs: 3 * HOUR, averageMs: null, mealCount: 1 })
  const future = core.computeStats([{ at: now - HOUR }, { at: now + HOUR }], now)
  assert.equal(future.longestMs, HOUR)
  assert.equal(future.averageMs, null)
})

test('historyGroups: newest first, grouped by day, with the fast each meal ended', () => {
  const now = at(2026, 9, 17, 21)
  const meals = [
    { at: at(2026, 9, 16, 13) },
    { at: at(2026, 9, 16, 20) },
    { at: at(2026, 9, 17, 12, 30) },
    { at: at(2026, 9, 17, 19) },
  ]
  const groups = core.historyGroups(meals, now)
  assert.deepEqual(groups.map((g) => g.label), ['Today', 'Yesterday'])
  assert.deepEqual(groups[0].items, [
    { at: at(2026, 9, 17, 19), gapMs: 6.5 * HOUR },
    { at: at(2026, 9, 17, 12, 30), gapMs: 16.5 * HOUR },
  ])
  assert.deepEqual(groups[1].items[1], { at: at(2026, 9, 16, 13), gapMs: null })

  const limited = core.historyGroups(meals, now, 3)
  assert.equal(limited.flatMap((g) => g.items).length, 3)
  // The oldest shown meal still knows the fast before it, even if that meal is hidden.
  assert.equal(limited[1].items[0].gapMs, 7 * HOUR)
})

test('backup round-trip and merge', () => {
  const now = at(2026, 9, 17, 21)
  let s = core.setGoal(core.defaultState(), 18)
  s = core.addMeal(s, at(2026, 9, 16, 20))
  s = core.addMeal(s, at(2026, 9, 17, 12))
  const backup = core.toBackup(s, now)
  assert.equal(backup.app, 'hearth')
  assert.match(backup.meals[0].local, /^2026-09-16T20:00:00/)

  const restored = core.parseBackup(JSON.stringify(backup))
  assert.deepEqual(restored, s)

  const other = core.addMeal(core.defaultState(), at(2026, 9, 15, 9))
  const merged = core.mergeMeals(core.addMeal(other, at(2026, 9, 16, 20)), restored)
  assert.equal(merged.added, 1)
  assert.equal(merged.state.goalHours, core.DEFAULT_GOAL)
  assert.deepEqual(merged.state.meals.map((m) => m.at), [at(2026, 9, 15, 9), at(2026, 9, 16, 20), at(2026, 9, 17, 12)])
})

test('parseBackup rejects foreign or damaged files without importing anything', () => {
  assert.throws(() => core.parseBackup('{oops'), /valid JSON/)
  assert.throws(() => core.parseBackup('{"meals": []}'), /Hearth backup/)
  assert.throws(() => core.parseBackup('[1,2]'), /Hearth backup/)
  assert.throws(
    () => core.parseBackup(JSON.stringify({ app: 'hearth', meals: [{ at: 100 }, { at: 'x' }] })),
    /1 unreadable entry/,
  )
})

test('formatBuild', () => {
  assert.equal(core.formatBuild({ id: 'a1b2c3d', date: '2026-09-17' }), 'Version a1b2c3d · Sep 17, 2026')
  assert.equal(core.formatBuild({ id: 'a1b2c3d', date: '__BUILD_DATE__' }), 'Version a1b2c3d')
  assert.equal(core.formatBuild({ id: '__BUILD_ID__', date: '__BUILD_DATE__' }), 'Development build')
  assert.equal(core.formatBuild(undefined), 'Development build')
})
