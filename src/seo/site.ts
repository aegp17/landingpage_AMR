import type { Locale } from '../i18n'
import { posts } from '../research'

export const SITE_URL = 'https://agentic-amr.com'
export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const LOGO_URL = `${SITE_URL}/logo.png`

export const LOCALES: Locale[] = ['en', 'es']

export function homePath(locale: Locale): string {
  return `/${locale}/`
}

export function postPath(locale: Locale, slug: string): string {
  return `/${locale}/research/${slug}/`
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}

export function ogLocale(locale: Locale): string {
  return locale === 'es' ? 'es_ES' : 'en_US'
}

export function altLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es'
}

/**
 * Returns the list of every URL the site exposes (used by the router and by
 * the sitemap generator). The paths are kept relative on purpose.
 */
export function allRoutePaths(): string[] {
  const paths: string[] = []
  for (const locale of LOCALES) {
    paths.push(homePath(locale))
    for (const post of posts) {
      paths.push(postPath(locale, post.id))
    }
  }
  return paths
}
