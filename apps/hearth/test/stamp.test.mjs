import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stampBuild } from '../scripts/stamp-build.mjs'

const site = fileURLToPath(new URL('../site/', import.meta.url))
const copy = () => {
  const dir = mkdtempSync(join(tmpdir(), 'hearth-'))
  cpSync(site, dir, { recursive: true })
  return dir
}

test('stamps the id and date into version.js and version.json', async () => {
  const dir = copy()
  stampBuild(dir, 'a1b2c3d', '2026-09-17')
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8')), { id: 'a1b2c3d', date: '2026-09-17' })
  const { BUILD } = await import(join(dir, 'version.js'))
  assert.deepEqual(BUILD, { id: 'a1b2c3d', date: '2026-09-17' })
})

test('refuses bad input and a second stamp', () => {
  const dir = copy()
  assert.throws(() => stampBuild(dir, 'main', '2026-09-17'), /git sha/)
  assert.throws(() => stampBuild(dir, 'a1b2c3d', '17/09/2026'), /YYYY-MM-DD/)
  stampBuild(dir, 'a1b2c3d', '2026-09-17')
  assert.throws(() => stampBuild(dir, 'b2c3d4e', '2026-09-18'), /no build placeholders/)
})

test('the source files in the repo stay unstamped', () => {
  assert.match(readFileSync(join(site, 'version.js'), 'utf8'), /__BUILD_ID__/)
  assert.match(readFileSync(join(site, 'version.json'), 'utf8'), /__BUILD_ID__/)
})
