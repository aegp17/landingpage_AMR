// Shared plumbing for the browser suites: a local copy of the app, a static
// server, a Chromium, and a tiny check() reporter.
//
// Chromium comes from the Playwright browsers already installed on the machine.
// Override with PLAYWRIGHT_CORE (path to playwright-core's index.mjs) and
// CHROMIUM (path to the browser binary) if yours live elsewhere.
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { spawn, execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const HOUR = 3600e3
export const APP_DIR = fileURLToPath(new URL('../../site/', import.meta.url))
const STAMP = fileURLToPath(new URL('../../scripts/stamp-build.mjs', import.meta.url))
// A random port every run, plus a token only this run's server can serve. A
// leaked server from an earlier run would otherwise answer on a fixed port and
// quietly test an older copy of the app, which reads exactly like a pass.
const randomPort = () => 20000 + Math.floor(Math.random() * 20000)

function playwrightCore() {
  if (process.env.PLAYWRIGHT_CORE) return process.env.PLAYWRIGHT_CORE
  return '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs'
}

function chromiumPath() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM
  const root = join(homedir(), 'Library/Caches/ms-playwright')
  const dirs = existsSync(root) ? readdirSync(root).filter((d) => d.startsWith('chromium-')).sort() : []
  for (const dir of dirs.reverse()) {
    for (const candidate of [
      'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      'chrome-linux/chrome',
    ]) {
      const path = join(root, dir, candidate)
      if (existsSync(path)) return path
    }
  }
  throw new Error('No Chromium found. Run `npx playwright install chromium` or set CHROMIUM.')
}

// A folder served like the published site: the app in its own directory, next
// to a page standing in for the landing, so worker scope can be checked.
export function site({ build } = {}) {
  const port = Number(process.env.PORT) || randomPort()
  const token = randomUUID()
  const root = mkdtempSync(join(tmpdir(), 'hearth-site-'))
  writeFileSync(join(root, 'landing.html'), '<!doctype html><title>Landing</title><p>Landing page</p>')
  writeFileSync(join(root, 'whoami.txt'), token)
  // Browsers ask for this on any page; without it the console fills with 404s.
  writeFileSync(join(root, 'favicon.ico'), '')
  const deploy = (id, date) => {
    rmSync(join(root, 'app'), { recursive: true, force: true })
    cpSync(APP_DIR, join(root, 'app'), { recursive: true })
    if (id) execFileSync('node', [STAMP, join(root, 'app'), id, date])
  }
  deploy(build?.id, build?.date)

  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
  const close = () => {
    server.kill()
    rmSync(root, { recursive: true, force: true })
  }
  // Leaving the server behind would poison the next run.
  process.on('exit', close)
  process.on('SIGINT', () => process.exit(130))

  return {
    root,
    port,
    base: `http://127.0.0.1:${port}`,
    appUrl: `http://127.0.0.1:${port}/app/`,
    landingUrl: `http://127.0.0.1:${port}/landing.html`,
    deploy,
    async ready() {
      for (let i = 0; i < 50; i++) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/whoami.txt`)
          if (response.ok) {
            const served = (await response.text()).trim()
            if (served === token) return
            throw new Error(`Port ${port} is taken by another server. Kill it, or set PORT.`)
          }
        } catch (error) {
          if (error.message.includes('taken by another server')) throw error
        }
        await new Promise((r) => setTimeout(r, 100))
      }
      throw new Error(`Nothing serving the app on port ${port}`)
    },
    close,
  }
}

export async function launchChromium() {
  const { chromium } = await import(playwrightCore())
  return chromium.launch({ executablePath: chromiumPath() })
}

export const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

export function reporter() {
  const results = []
  return {
    check(name, ok, detail = '') {
      results.push({ name, ok: Boolean(ok) })
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
    },
    finish() {
      const failed = results.filter((r) => !r.ok)
      console.log(`\n${results.length - failed.length}/${results.length} passed`)
      return failed.length
    },
  }
}

// localStorage helpers, used by every suite.
export const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('hearth.v1')))
export const seed = (page, state) => page.evaluate((s) => localStorage.setItem('hearth.v1', JSON.stringify(s)), state)
export const state = (overrides = {}) => ({ version: 1, goalHours: 16, meals: [], remindAtGoal: false, notifiedFor: null, ...overrides })
export const localInput = (page, offsetMs) =>
  page.evaluate((offset) => {
    const d = new Date(Date.now() + offset)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
  }, offsetMs)
