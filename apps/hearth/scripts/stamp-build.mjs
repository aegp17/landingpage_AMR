// Writes the build id and date into a copy of the app, e.g. in the deploy workflow:
//   node apps/hearth/scripts/stamp-build.mjs dist/<folder> <short sha> <YYYY-MM-DD>
// Fails loudly rather than shipping an unstamped app, which would never update.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const STAMPED_FILES = ['version.js', 'version.json']

export function stampBuild(dir, id, date) {
  if (!/^[0-9a-f]{7,40}$/.test(id)) throw new Error(`Build id must be a git sha, got "${id}"`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Build date must be YYYY-MM-DD, got "${date}"`)
  for (const name of STAMPED_FILES) {
    const path = join(dir, name)
    const source = readFileSync(path, 'utf8')
    if (!source.includes('__BUILD_ID__') || !source.includes('__BUILD_DATE__')) {
      throw new Error(`${path} has no build placeholders (already stamped?)`)
    }
    writeFileSync(path, source.replaceAll('__BUILD_ID__', id).replaceAll('__BUILD_DATE__', date))
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dir, id, date] = process.argv.slice(2)
  try {
    stampBuild(dir, id, date)
    console.log(`Stamped ${dir} with build ${id} (${date})`)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
