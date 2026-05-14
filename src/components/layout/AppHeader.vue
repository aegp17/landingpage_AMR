<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n, localeFromPath } from '../../i18n'

const { t, locale, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const isHome = computed(() => {
  const p = route.path
  return p === `/${locale.value}/` || p === `/${locale.value}`
})

const homeHref = computed(() => `/${locale.value}/`)

function scrollTo(id: string, e?: Event) {
  mobileOpen.value = false
  if (isHome.value) {
    // Same-page anchor: do the smooth scroll ourselves.
    e?.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    // Navigate to the home page first; the browser will jump to the anchor.
    router.push(`${homeHref.value}#${id}`)
  }
}

function switchLocale() {
  const target = locale.value === 'en' ? 'es' : 'en'
  const current = route.path
  let next: string
  if (current.startsWith('/en/')) next = '/es/' + current.slice('/en/'.length)
  else if (current.startsWith('/es/')) next = '/en/' + current.slice('/es/'.length)
  else if (current === '/en' || current === '/es' || current === '/') next = `/${target}/`
  else next = `/${target}/`
  // Persist user choice for the next visit to `/`.
  setLocale(target)
  router.push(next)
}

// Nav anchors use href so they remain crawlable; the click handler intercepts
// the smooth-scroll behavior client-side.
function anchorHref(id: string): string {
  return isHome.value ? `#${id}` : `${homeHref.value}#${id}`
}

// localeFromPath is referenced indirectly to keep the import tree stable for
// SSG. It's exposed via useI18n so we don't need to import it directly here.
void localeFromPath
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link class="logo" :to="homeHref">Agentic<span>-AMR</span></router-link>

      <nav class="nav-desktop" aria-label="Main navigation">
        <a :href="anchorHref('services')" @click="scrollTo('services', $event)">{{ t.nav.services }}</a>
        <a :href="anchorHref('process')" @click="scrollTo('process', $event)">{{ t.nav.process }}</a>
        <a :href="anchorHref('team')" @click="scrollTo('team', $event)">{{ t.nav.team }}</a>
        <a :href="anchorHref('skills')" @click="scrollTo('skills', $event)">{{ t.nav.skills }}</a>
        <a :href="anchorHref('research')" @click="scrollTo('research', $event)">{{ t.nav.research }}</a>
        <a :href="anchorHref('contact')" @click="scrollTo('contact', $event)">{{ t.nav.contact }}</a>
        <button class="lang-toggle" @click="switchLocale" :aria-label="locale === 'en' ? 'Cambiar a español' : 'Switch to English'">
          {{ locale === 'en' ? 'ES' : 'EN' }}
        </button>
      </nav>

      <div class="mobile-controls">
        <button class="lang-toggle" @click="switchLocale">
          {{ locale === 'en' ? 'ES' : 'EN' }}
        </button>
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <nav class="nav-mobile" :class="{ open: mobileOpen }" aria-label="Mobile navigation">
      <a :href="anchorHref('services')" @click="scrollTo('services', $event)">{{ t.nav.services }}</a>
      <a :href="anchorHref('process')" @click="scrollTo('process', $event)">{{ t.nav.process }}</a>
      <a :href="anchorHref('team')" @click="scrollTo('team', $event)">{{ t.nav.team }}</a>
      <a :href="anchorHref('skills')" @click="scrollTo('skills', $event)">{{ t.nav.skills }}</a>
      <a :href="anchorHref('research')" @click="scrollTo('research', $event)">{{ t.nav.research }}</a>
      <a :href="anchorHref('contact')" @click="scrollTo('contact', $event)">{{ t.nav.contact }}</a>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logo span {
  color: #6366f1;
  font-weight: 800;
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-desktop a {
  text-decoration: none;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-desktop a:hover {
  color: #6366f1;
}

.lang-toggle {
  background: none;
  border: 1.5px solid rgba(99, 102, 241, 0.4);
  color: #6366f1;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-toggle:hover {
  background: #6366f1;
  color: #fff;
}

.mobile-controls {
  display: none;
  align-items: center;
  gap: 0.75rem;
}

.hamburger {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  cursor: pointer;
  position: relative;
}

.hamburger span,
.hamburger span::before,
.hamburger span::after {
  display: block;
  width: 100%;
  height: 2px;
  background: #0f172a;
  border-radius: 2px;
  transition: all 0.3s;
  position: absolute;
  left: 0;
}

.hamburger span {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger span::before {
  content: '';
  top: -8px;
}

.hamburger span::after {
  content: '';
  top: 8px;
}

.hamburger span.open {
  background: transparent;
}

.hamburger span.open::before {
  top: 0;
  transform: rotate(45deg);
}

.hamburger span.open::after {
  top: 0;
  transform: rotate(-45deg);
}

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 0 1.5rem 1rem;
  gap: 0.75rem;
}

.nav-mobile.open {
  display: flex;
}

.nav-mobile a {
  text-decoration: none;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }

  .mobile-controls {
    display: flex;
  }
}
</style>
