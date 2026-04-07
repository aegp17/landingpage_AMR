import { ref, computed } from 'vue'
import en from './en'
import es from './es'

type Locale = 'en' | 'es'

const translations = { en, es } as const

const currentLocale = ref<Locale>(
  (localStorage.getItem('locale') as Locale) || 'en'
)

export function useI18n() {
  const locale = computed(() => currentLocale.value)

  const t = computed(() => translations[currentLocale.value])

  function setLocale(l: Locale) {
    currentLocale.value = l
    localStorage.setItem('locale', l)
    document.documentElement.lang = l
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'en' ? 'es' : 'en')
  }

  return { locale, t, setLocale, toggleLocale }
}
