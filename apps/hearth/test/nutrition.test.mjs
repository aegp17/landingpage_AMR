import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as n from '../site/nutrition.js'

const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime()
const profile = (overrides = {}) => ({ sex: 'male', age: 34, heightCm: 178, weightKg: 82, activity: 'light', weeklyKg: 0.5, ...overrides })
const entry = (kcal, kind, when, label = '') => n.makeEntry({ at: when, kcal, kind, label })

test('bmr follows Mifflin-St Jeor for both sexes', () => {
  // 10*82 + 6.25*178 - 5*34 + 5 = 1767.5 -> 1768
  assert.equal(n.bmr(profile()), 1768)
  // the female formula is the same minus 166 relative to the male one
  assert.equal(n.bmr(profile({ sex: 'female' })), 1768 - 166)
})

test('tdee multiplies by the activity factor', () => {
  assert.equal(n.tdee(profile({ activity: 'sedentary' })), Math.round(1768 * 1.2))
  assert.equal(n.tdee(profile({ activity: 'light' })), Math.round(1768 * 1.375))
  assert.equal(n.tdee(profile({ activity: 'intense' })), Math.round(1768 * 1.9))
})

test('plan turns a weekly goal into a daily target', () => {
  const maintenance = n.tdee(profile())
  const half = n.plan(profile({ weeklyKg: 0.5 }))
  assert.equal(half.maintenance, maintenance)
  assert.equal(half.dailyDeficit, 550) // 0.5 kg * 7700 / 7
  assert.equal(half.target, Math.round((maintenance - 550) / 10) * 10)
  assert.equal(half.clamped, false)

  const maintain = n.plan(profile({ weeklyKg: 0 }))
  assert.equal(maintain.dailyDeficit, 0)
  assert.equal(maintain.target, Math.round(maintenance / 10) * 10)
})

test('plan never steers below the floor, and says when it clamped', () => {
  const small = profile({ sex: 'female', age: 60, heightCm: 150, weightKg: 48, activity: 'sedentary', weeklyKg: 1 })
  const result = n.plan(small)
  assert.ok(result.maintenance - result.dailyDeficit < n.FLOORS.female, 'the arithmetic wanted less than the floor')
  assert.equal(result.target, n.FLOORS.female)
  assert.equal(result.clamped, true)
})

test('validateProfile points at each bad field', () => {
  assert.equal(n.validateProfile(profile()).ok, true)
  const { ok, errors } = n.validateProfile({ sex: 'x', age: 4, heightCm: 400, weightKg: 0, activity: 'nope', weeklyKg: 3 })
  assert.equal(ok, false)
  assert.deepEqual(Object.keys(errors).sort(), ['activity', 'age', 'heightCm', 'sex', 'weeklyKg', 'weightKg'])
  assert.match(errors.weightKg, /between 30 and 300 kg/)
  assert.equal(n.validateProfile({ ...profile(), age: '34' }).ok, false, 'strings are not numbers')
})

test('targetFor prefers your own number over the suggestion', () => {
  let state = n.setProfile(n.defaultCalorieState(), profile())
  assert.equal(n.targetFor(state), n.plan(profile()).target)
  state = n.setTargetOverride(state, 1700)
  assert.equal(n.targetFor(state), 1700)
  assert.equal(n.targetFor(n.setTargetOverride(state, null)), n.plan(profile()).target)
  assert.equal(n.targetFor(n.defaultCalorieState()), null, 'no profile, no target')
  assert.throws(() => n.setTargetOverride(state, 100), RangeError)
})

test('entries: added sorted, removed one by one, immutable', () => {
  const day = at(2026, 9, 21, 12)
  const a = entry(600, 'food', day)
  const b = entry(320, 'exercise', day - 3600e3)
  let state = n.addEntry(n.defaultCalorieState(), a)
  const before = state
  state = n.addEntry(state, b)
  assert.deepEqual(state.entries.map((e) => e.kcal), [320, 600])
  assert.equal(before.entries.length, 1, 'the previous state is untouched (undo relies on it)')
  assert.deepEqual(n.removeEntry(state, a.id).entries.map((e) => e.id), [b.id])
  assert.throws(() => n.addEntry(state, { id: 'x', at: day, kind: 'food', kcal: 0 }), TypeError)
})

test('dayBudget: food spends it, exercise gives it back', () => {
  const now = at(2026, 9, 21, 20)
  let state = n.setTargetOverride(n.setProfile(n.defaultCalorieState(), profile()), 1700)
  state = n.addEntry(state, entry(500, 'food', at(2026, 9, 21, 8)))
  state = n.addEntry(state, entry(740, 'food', at(2026, 9, 21, 13)))
  state = n.addEntry(state, entry(320, 'exercise', at(2026, 9, 21, 18)))
  const budget = n.dayBudget(state, now)
  assert.deepEqual(
    { target: budget.target, food: budget.food, exercise: budget.exercise, remaining: budget.remaining, over: budget.over },
    { target: 1700, food: 1240, exercise: 320, remaining: 780, over: false },
  )

  const heavy = n.addEntry(state, entry(1200, 'food', at(2026, 9, 21, 21)))
  const over = n.dayBudget(heavy, now)
  assert.equal(over.remaining, -420)
  assert.equal(over.over, true)
})

test('dayBudget only counts today, by the local calendar', () => {
  const now = at(2026, 9, 21, 0, 30)
  let state = n.setTargetOverride(n.defaultCalorieState(), 2000)
  state = n.addEntry(state, entry(900, 'food', at(2026, 9, 20, 23, 50)))
  state = n.addEntry(state, entry(300, 'food', at(2026, 9, 21, 0, 10)))
  const budget = n.dayBudget(state, now)
  assert.equal(budget.food, 300, 'last night belongs to yesterday')
  assert.equal(budget.count, 1)
})

test('dayBudget without a target still counts what you logged', () => {
  const now = at(2026, 9, 21, 20)
  const state = n.addEntry(n.defaultCalorieState(), entry(450, 'food', now))
  const budget = n.dayBudget(state, now)
  assert.deepEqual({ target: budget.target, food: budget.food, remaining: budget.remaining }, { target: null, food: 450, remaining: null })
})

test('daySummaries: newest first, with the gap against the target', () => {
  const now = at(2026, 9, 21, 21)
  let state = n.setTargetOverride(n.defaultCalorieState(), 1700)
  state = n.addEntry(state, entry(1800, 'food', at(2026, 9, 19, 13)))
  state = n.addEntry(state, entry(1500, 'food', at(2026, 9, 20, 13)))
  state = n.addEntry(state, entry(300, 'exercise', at(2026, 9, 20, 18)))
  state = n.addEntry(state, entry(900, 'food', at(2026, 9, 21, 13)))
  const days = n.daySummaries(state, now)
  assert.deepEqual(days.map((d) => d.label), ['Today', 'Yesterday', 'Sat, Sep 19'])
  assert.deepEqual(days.map((d) => d.difference), [900 - 1700, 1500 - 300 - 1700, 1800 - 1700])
  assert.equal(n.daySummaries(state, now, 2).length, 2)
})

test('normalizeCalorieState repairs whatever comes back from storage', () => {
  const day = at(2026, 9, 21, 12)
  const good = n.makeEntry({ at: day, kcal: 400, kind: 'food', label: 'Arroz con pollo' })
  const state = n.normalizeCalorieState({
    profile: { sex: 'male', age: 34, heightCm: 178, weightKg: 82, activity: 'nope', weeklyKg: 9 },
    targetOverride: 99,
    entries: [good, good, null, { id: 'x', at: day, kind: 'snack', kcal: 10 }, { id: 'y', at: day, kind: 'food', kcal: 0 }],
  })
  assert.equal(state.entries.length, 1, 'duplicates and junk dropped')
  assert.equal(state.entries[0].label, 'Arroz con pollo')
  assert.equal(state.profile.activity, 'light', 'unknown activity falls back')
  assert.equal(state.profile.weeklyKg, 0.5)
  assert.equal(state.targetOverride, null, 'an impossible target is not kept')
  assert.deepEqual(n.normalizeCalorieState(null), n.defaultCalorieState())
  assert.equal(n.normalizeCalorieState({ profile: { sex: 'male' } }).profile, null, 'an incomplete profile is no profile')
})

test('formatKcal groups thousands', () => {
  assert.equal(n.formatKcal(1930), '1,930')
  assert.equal(n.formatKcal(780.4), '780')
})

// ---------------------------------------------------------------- foods

const FOODS = JSON.parse(readFileSync(new URL('../site/foods.json', import.meta.url), 'utf8')).foods
const food = (id) => FOODS.find((f) => f.id === id)

test('the food database is whole and plausible', () => {
  assert.ok(FOODS.length >= 80, `only ${FOODS.length} foods`)
  const ids = new Set()
  for (const f of FOODS) {
    assert.ok(!ids.has(f.id), `duplicate id ${f.id}`)
    ids.add(f.id)
    assert.match(f.id, /^[a-z0-9-]+$/)
    assert.ok(f.name && f.category && f.usda && f.fdcId, `${f.id} is missing fields`)
    assert.ok(Number.isInteger(f.kcal100) && f.kcal100 >= 0 && f.kcal100 <= 900, `${f.id}: ${f.kcal100} kcal/100 g`)
    for (const portion of f.portions) {
      assert.ok(portion.label && Number.isInteger(portion.grams) && portion.grams >= 5 && portion.grams <= 500, `${f.id}: ${JSON.stringify(portion)}`)
    }
  }
})

test('the values match the USDA reference entries they come from', () => {
  // Spot checks against SR Legacy, the source the file records.
  assert.equal(food('white-rice').kcal100, 130)
  assert.equal(food('chicken-breast').kcal100, 165)
  assert.equal(food('boiled-egg').kcal100, 155)
  assert.equal(food('banana').kcal100, 89)
  assert.equal(food('avocado').kcal100, 160)
  assert.equal(food('olive-oil').kcal100, 884)
  assert.equal(food('black-beans').kcal100, 132)
  assert.equal(food('fried-plantain').kcal100, 309)
})

test('search finds food by English name and by Spanish alias, accents or not', () => {
  const ids = (q) => n.searchFoods(FOODS, q).map((f) => f.id)
  assert.deepEqual(ids('rice').slice(0, 2).sort(), ['brown-rice', 'white-rice'])
  assert.equal(ids('white rice')[0], 'white-rice')
  assert.equal(ids('arroz')[0], 'white-rice', 'the exact alias wins over "arroz integral"')
  assert.equal(ids('POLLO')[0], 'chicken-breast')
  assert.equal(ids('piña')[0], 'pineapple')
  assert.equal(ids('pina')[0], 'pineapple')
  assert.ok(ids('huevo').includes('boiled-egg') && ids('huevo').includes('fried-egg'))
  assert.ok(ids('verde').includes('green-plantain'))
  assert.deepEqual(n.searchFoods(FOODS, '   '), [])
  assert.deepEqual(n.searchFoods(FOODS, 'zzzz'), [])
  assert.ok(n.searchFoods(FOODS, 'a', 5).length <= 5, 'honours the limit')
})

test('calories scale with grams', () => {
  const rice = food('white-rice')
  assert.equal(n.foodKcal(rice, 100), 130)
  assert.equal(n.foodKcal(rice, 158), 205) // the 1 cup portion
  assert.equal(n.foodKcal(rice, 0), 0)
  assert.deepEqual(n.makeItem(rice, 150), { foodId: 'white-rice', name: rice.name, grams: 150, kcal: 195 })
  assert.equal(n.itemsTotal([n.makeItem(rice, 150), n.makeItem(food('chicken-breast'), 120)]), 195 + 198)
})

test('a meal keeps its items, and its total is always their sum', () => {
  const now = at(2026, 9, 21, 13)
  const items = [n.makeItem(food('white-rice'), 150), n.makeItem(food('chicken-breast'), 120)]
  const meal = { ...n.makeEntry({ at: now, kcal: n.itemsTotal(items), kind: 'food', label: 'Lunch' }), items }
  const state = n.addEntry(n.defaultCalorieState(), meal)
  assert.equal(n.dayBudget(n.setTargetOverride(state, 1700), now).food, 393)

  // A stored total that disagrees with the items is repaired, not trusted.
  const repaired = n.normalizeCalorieState({ entries: [{ ...meal, kcal: 9 }] })
  assert.equal(repaired.entries[0].kcal, 393)
  assert.equal(repaired.entries[0].items.length, 2)

  // Junk items are dropped, and the total follows.
  const cleaned = n.normalizeCalorieState({ entries: [{ ...meal, items: [items[0], { foodId: 'x' }] }] })
  assert.equal(cleaned.entries[0].items.length, 1)
  assert.equal(cleaned.entries[0].kcal, 195)
})

test('mealNameFor names the meal by the clock', () => {
  assert.equal(n.mealNameFor(new Date(2026, 8, 21, 8)), 'Breakfast')
  assert.equal(n.mealNameFor(new Date(2026, 8, 21, 13)), 'Lunch')
  assert.equal(n.mealNameFor(new Date(2026, 8, 21, 19)), 'Dinner')
  assert.equal(n.mealNameFor(new Date(2026, 8, 21, 23)), 'Snack')
})

test('recentFoods lists what you logged, newest first, without repeats', () => {
  const day = at(2026, 9, 21, 8)
  const entries = [
    { items: [n.makeItem(food('white-rice'), 100), n.makeItem(food('banana'), 100)] },
    { items: [n.makeItem(food('coffee'), 240)] },
    { items: [n.makeItem(food('banana'), 120)] },
    { at: day, kcal: 200, kind: 'food' },
  ]
  assert.deepEqual(n.recentFoods(entries, FOODS).map((f) => f.id), ['banana', 'coffee', 'white-rice'])
  assert.equal(n.recentFoods(entries, FOODS, 2).length, 2)
  assert.deepEqual(n.recentFoods([{ items: [{ foodId: 'gone', name: 'x', grams: 1, kcal: 1 }] }], FOODS), [])
})
