import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://agentic-amr.com'
const LOCALES = ['en', 'es'] as const

const __dirname = fileURLToPath(new URL('.', import.meta.url))

interface PostRecord {
  id: string
  date: string
  title: { en: string; es: string }
  excerpt: { en: string; es: string }
  author: string
}

function readPosts(): PostRecord[] {
  const dir = join(__dirname, 'src', 'research', 'posts')
  const out: PostRecord[] = []
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const id = file.replace(/\.json$/, '')
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Omit<PostRecord, 'id'>
    out.push({ id, ...raw })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1))
}

function listPostIds(): string[] {
  return readPosts().map((p) => p.id)
}

function buildRoutes(): string[] {
  const ids = listPostIds()
  const out: string[] = []
  for (const locale of LOCALES) {
    out.push(`/${locale}/`)
    out.push(`/${locale}/research/`)
    for (const id of ids) {
      out.push(`/${locale}/research/${id}/`)
    }
  }
  return out
}

function readAuthors(): Record<string, { name: string }> {
  const path = join(__dirname, 'src', 'research', 'authors.ts')
  const src = readFileSync(path, 'utf8')
  const out: Record<string, { name: string }> = {}
  // Match `key: { name: '...', ... }` pairs in the authors export.
  const blockRe = /(\w+):\s*\{\s*name:\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = blockRe.exec(src)) !== null) {
    out[m[1]] = { name: m[2] }
  }
  return out
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildAtomFeed(locale: 'en' | 'es', posts: PostRecord[], authors: Record<string, { name: string }>): string {
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`
  const indexUrl = `${SITE_URL}/${locale}/research/`
  const feedTitle = locale === 'es' ? 'Investigación · Agentic-AMR' : 'Research · Agentic-AMR'
  const feedSubtitle =
    locale === 'es'
      ? 'Investigación aplicada, notas técnicas y casos de estudio del equipo Agentic-AMR.'
      : 'Applied research, technical notes, and case studies from the Agentic-AMR team.'
  const updated = posts.length
    ? new Date(posts[0].date + 'T00:00:00Z').toISOString()
    : new Date().toISOString()

  const entries = posts
    .map((p) => {
      const postUrl = `${SITE_URL}/${locale}/research/${p.id}/`
      const authorName = authors[p.author]?.name ?? 'Agentic-AMR Consultants'
      const published = new Date(p.date + 'T00:00:00Z').toISOString()
      return (
        `  <entry>\n` +
        `    <title>${xmlEscape(p.title[locale])}</title>\n` +
        `    <link href="${postUrl}" rel="alternate" type="text/html" />\n` +
        `    <id>${postUrl}</id>\n` +
        `    <updated>${published}</updated>\n` +
        `    <published>${published}</published>\n` +
        `    <author><name>${xmlEscape(authorName)}</name></author>\n` +
        `    <summary>${xmlEscape(p.excerpt[locale])}</summary>\n` +
        `  </entry>`
      )
    })
    .join('\n')

  return (
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">\n` +
    `  <title>${xmlEscape(feedTitle)}</title>\n` +
    `  <subtitle>${xmlEscape(feedSubtitle)}</subtitle>\n` +
    `  <link href="${indexUrl}" rel="alternate" type="text/html" />\n` +
    `  <link href="${feedUrl}" rel="self" type="application/atom+xml" />\n` +
    `  <id>${feedUrl}</id>\n` +
    `  <updated>${updated}</updated>\n` +
    `  <author><name>Agentic-AMR Consultants</name></author>\n` +
    (entries ? entries + '\n' : '') +
    `</feed>\n`
  )
}

function buildSitemap(routes: string[]): string {
  const urls: string[] = []
  for (const route of routes) {
    // Emit one <url> per route. EN entries advertise the ES alternate (and
    // vice-versa) so Google can map the bilingual pair.
    let canonical: string
    let alt: string
    if (route.startsWith('/en/')) {
      const altRoute = '/es/' + route.slice('/en/'.length)
      canonical = `${SITE_URL}${route}`
      alt = `${SITE_URL}${altRoute}`
      urls.push(
        `  <url>\n` +
          `    <loc>${canonical}</loc>\n` +
          `    <xhtml:link rel="alternate" hreflang="en" href="${canonical}" />\n` +
          `    <xhtml:link rel="alternate" hreflang="es" href="${alt}" />\n` +
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${canonical}" />\n` +
          `  </url>`,
      )
    } else if (route.startsWith('/es/')) {
      const altRoute = '/en/' + route.slice('/es/'.length)
      canonical = `${SITE_URL}${route}`
      alt = `${SITE_URL}${altRoute}`
      urls.push(
        `  <url>\n` +
          `    <loc>${canonical}</loc>\n` +
          `    <xhtml:link rel="alternate" hreflang="en" href="${alt}" />\n` +
          `    <xhtml:link rel="alternate" hreflang="es" href="${canonical}" />\n` +
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${alt}" />\n` +
          `  </url>`,
      )
    }
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls.join('\n') +
    `\n</urlset>\n`
  )
}

export default defineConfig({
  plugins: [vue()],
  base: '/',
  // @ts-expect-error — `ssgOptions` is consumed by vite-ssg, not vite itself.
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes(): string[] {
      return buildRoutes()
    },
    onFinished() {
      const routes = buildRoutes()

      // Emit dist/sitemap.xml from the same list vite-ssg just prerendered.
      const xml = buildSitemap(routes)
      writeFileSync(join(__dirname, 'dist', 'sitemap.xml'), xml, 'utf8')
      // eslint-disable-next-line no-console
      console.log(`[vite-ssg] wrote dist/sitemap.xml with ${routes.length} URLs`)

      // Emit per-locale Atom feeds at dist/{locale}/feed.xml.
      const posts = readPosts()
      const authors = readAuthors()
      for (const locale of LOCALES) {
        const feed = buildAtomFeed(locale, posts, authors)
        const feedDir = join(__dirname, 'dist', locale)
        writeFileSync(join(feedDir, 'feed.xml'), feed, 'utf8')
        // eslint-disable-next-line no-console
        console.log(`[vite-ssg] wrote dist/${locale}/feed.xml with ${posts.length} entries`)
      }

      // dist/index.html is the SPA shell vite-ssg leaves untouched for `/`.
      // Inject a meta-refresh + canonical so crawlers (and JS-disabled users)
      // bounce straight to the English home instead of seeing an empty page.
      const rootIndex = join(__dirname, 'dist', 'index.html')
      if (existsSync(rootIndex)) {
        const html = readFileSync(rootIndex, 'utf8')
        if (!html.includes('http-equiv="refresh"')) {
          const inject =
            `    <link rel="canonical" href="${SITE_URL}/en/" />\n` +
            `    <meta http-equiv="refresh" content="0; url=/en/" />\n`
          const patched = html.replace('</head>', `${inject}  </head>`)
          writeFileSync(rootIndex, patched, 'utf8')
        }
      }
    },
  },
})
