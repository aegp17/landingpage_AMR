import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://agentic-amr.com'
const LOCALES = ['en', 'es'] as const

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function listPostIds(): string[] {
  const dir = join(__dirname, 'src', 'research', 'posts')
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

function buildRoutes(): string[] {
  const ids = listPostIds()
  const out: string[] = []
  for (const locale of LOCALES) {
    out.push(`/${locale}/`)
    for (const id of ids) {
      out.push(`/${locale}/research/${id}/`)
    }
  }
  return out
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
