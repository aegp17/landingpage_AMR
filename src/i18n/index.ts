import { computed } from 'vue'
import { useRoute } from 'vue-router'
import en from './en'
import es from './es'

export type Locale = 'en' | 'es'

const translations = { en, es } as const

const isBrowser = typeof window !== 'undefined'

function localeFromPath(path: string | undefined | null): Locale {
  if (!path) return 'en'
  if (path === '/es' || path.startsWith('/es/')) return 'es'
  return 'en'
}

/**
 * Reactive locale derived from the current route. Falls back to `/en/` for the
 * root path so SSG output stays deterministic. `localStorage` is still read on
 * the client purely as a UX hint when the user lands on `/`.
 */
export function useI18n() {
  const route = useRoute()

  const locale = computed<Locale>(() => localeFromPath(route?.path))

  const t = computed(() => translations[locale.value])

  function setLocale(l: Locale) {
    if (isBrowser) {
      try {
        localStorage.setItem('locale', l)
      } catch {
        /* ignore (private mode, etc.) */
      }
      document.documentElement.lang = l
    }
  }

  function toggleLocale() {
    setLocale(locale.value === 'en' ? 'es' : 'en')
  }

  return { locale, t, setLocale, toggleLocale }
}

export { localeFromPath }
