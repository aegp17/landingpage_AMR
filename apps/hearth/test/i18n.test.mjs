import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as i18n from '../site/i18n.js'
import * as core from '../site/core.js'
import * as n from '../site/nutrition.js'

const site = fileURLToPath(new URL('../site/', import.meta.url))
const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime()

test('both dictionaries carry exactly the same keys', () => {
  const { en, es } = i18n.dictionaries()
  const missingInEs = Object.keys(en).filter((key) => !(key in es))
  const missingInEn = Object.keys(es).filter((key) => !(key in en))
  assert.deepEqual(missingInEs, [], 'keys with no Spanish')
  assert.deepEqual(missingInEn, [], 'keys with no English')
  assert.ok(Object.keys(en).length > 150, `only ${Object.keys(en).length} keys`)
})

test('a translation never loses a placeholder', () => {
  const { en, es } = i18n.dictionaries()
  const holes = (text) => (text.match(/\{(\w+)\}/g) || []).sort()
  for (const key of Object.keys(en)) {
    assert.deepEqual(holes(es[key]), holes(en[key]), `${key}: "${en[key]}" vs "${es[key]}"`)
  }
})

test('no Spanish string was left in English by accident', () => {
  const { en, es } = i18n.dictionaries()
  const same = Object.keys(en).filter((key) => en[key] === es[key])
  // The few that are the same in both: units, formatting, and words Spanish borrows.
  const allowed = [
    'cal.kcal',
    'cal.kcalPlus',
    'cal.unit',
    'common.grams',
    'language.en',
    'language.es',
    'meal.snack',
    'perKg.option',
    'picker.hundred',
    'picker.total',
    'protein.preview',
  ]
  assert.deepEqual(same.sort(), allowed.sort())
})

test('the device language decides, and anything unknown falls back to English', () => {
  assert.equal(i18n.detectLanguage(['es-EC', 'en-US']), 'es')
  assert.equal(i18n.detectLanguage(['es']), 'es')
  assert.equal(i18n.detectLanguage(['ES-es']), 'es')
  assert.equal(i18n.detectLanguage(['en-GB']), 'en')
  assert.equal(i18n.detectLanguage(['pt-BR', 'es-419']), 'es', 'the first tag we know wins')
  assert.equal(i18n.detectLanguage(['fr-FR', 'de']), 'en')
  assert.equal(i18n.detectLanguage([]), 'en')
})

test('t fills the holes and falls back to English for a missing key', () => {
  i18n.setLanguage('en')
  assert.equal(i18n.t('fast.goalChip', { hours: 16 }), 'Goal 16h')
  i18n.setLanguage('es')
  assert.equal(i18n.t('fast.goalChip', { hours: 16 }), 'Meta 16 h')
  assert.equal(i18n.t('does.not.exist'), 'does.not.exist')
  assert.equal(i18n.t('fast.goalChip', {}), 'Meta {hours} h', 'a missing value leaves the hole visible')
})

test('the running language reaches the pure logic', () => {
  const now = at(2026, 9, 29, 13)
  i18n.setLanguage('en')
  assert.equal(core.formatDuration(15 * 3600e3 + 20 * 60e3), '15h 20m')
  assert.equal(core.greetingFor(new Date(now)), 'Good afternoon')
  assert.equal(core.dayLabel(now, now), 'Today')
  assert.equal(core.stageFor(1), 'Goal reached. Beautifully done.')
  assert.equal(n.mealNameFor(new Date(now)), 'Lunch')
  assert.equal(core.goalNotification({ goalHours: 16 }).title, '16h fast complete')

  i18n.setLanguage('es')
  assert.equal(core.formatDuration(15 * 3600e3 + 20 * 60e3), '15 h 20 min')
  assert.equal(core.greetingFor(new Date(now)), 'Buenas tardes')
  assert.equal(core.dayLabel(now, now), 'Hoy')
  assert.equal(core.dayLabel(now - 24 * 3600e3, now), 'Ayer')
  assert.equal(core.stageFor(1), 'Meta cumplida. Muy bien.')
  assert.equal(n.mealNameFor(new Date(now)), 'Almuerzo')
  assert.equal(core.goalNotification({ goalHours: 16 }).title, 'Ayuno de 16 h completo')
  assert.match(core.buildIcs({ goalHours: 16, meals: [{ at: now - 3600e3 }] }, now), /SUMMARY:Meta de ayuno cumplida \(16 h\)/)
})

test('dates and numbers follow the language, not just the words', () => {
  const day = at(2026, 9, 26, 20, 42)
  const now = at(2026, 9, 29, 12)
  i18n.setLanguage('en')
  const englishDay = core.dayLabel(day, now)
  const englishTime = core.formatTime(day)
  i18n.setLanguage('es')
  assert.notEqual(core.dayLabel(day, now), englishDay, `both said "${englishDay}"`)
  assert.notEqual(core.formatTime(day), englishTime, `both said "${englishTime}"`)
  assert.match(core.formatTime(day), /20:42|8:42/)
})

test('the activity and protein pickers speak the running language', () => {
  i18n.setLanguage('en')
  assert.equal(n.ACTIVITIES[0].label, 'Mostly sitting')
  assert.equal(n.PROTEIN_PER_KG[2].label, 'Building muscle')
  i18n.setLanguage('es')
  assert.equal(n.ACTIVITIES[0].label, 'Sobre todo sentado')
  assert.equal(n.PROTEIN_PER_KG[2].label, 'Ganar músculo')
  assert.equal(n.validateProfile({}).errors.age, 'Edad entre 14 y 100.')
})

test('every key the code asks for exists, and every key in the dictionary is used', () => {
  const sources = readdirSync(site)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(site + file, 'utf8'))
    .join('\n')
  const html = readFileSync(site + 'index.html', 'utf8')
  const used = new Set()
  for (const match of sources.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(match[1])
  for (const match of sources.matchAll(/\bt\(\s*`([\w.]+)\$\{/g)) used.add(match[1])
  for (const match of html.matchAll(/data-i18n(?:-placeholder|-aria)?="([\w.]+)"/g)) used.add(match[1])
  // A key chosen inside a call, like t(n === 1 ? 'a.one' : 'a.many'), only shows
  // up as a bare literal, so the dead-key check looks for those too.
  const mentioned = new Set(used)
  for (const match of sources.matchAll(/'([a-z][\w]*\.[\w.]+)'/g)) mentioned.add(match[1])

  const { en } = i18n.dictionaries()
  // Keys built from a template contribute only their prefix; they end in a dot.
  const unknown = [...used].filter((key) => !key.endsWith('.') && !(key in en))
  assert.deepEqual(unknown, [], 'the code asks for keys the dictionary does not have')

  // Keys built at runtime (activity.*, perKg.*, language.*) are reached through
  // a template, so they are counted by their prefix.
  const prefixes = ['activity.', 'perKg.', 'language.']
  const unused = Object.keys(en).filter((key) => !mentioned.has(key) && !prefixes.some((prefix) => key.startsWith(prefix)))
  assert.deepEqual(unused, [], 'dead keys in the dictionary')
})
