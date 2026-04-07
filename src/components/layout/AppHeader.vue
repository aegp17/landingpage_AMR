<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../i18n'

const { t, locale, toggleLocale } = useI18n()
const mobileOpen = ref(false)

function scrollTo(id: string) {
  mobileOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <a class="logo" href="#" @click.prevent="scrollTo('hero')">Ramyx<span>Lab</span></a>

      <nav class="nav-desktop" aria-label="Main navigation">
        <a href="#services" @click.prevent="scrollTo('services')">{{ t.nav.services }}</a>
        <a href="#team" @click.prevent="scrollTo('team')">{{ t.nav.team }}</a>
        <a href="#contact" @click.prevent="scrollTo('contact')">{{ t.nav.contact }}</a>
        <button class="lang-toggle" @click="toggleLocale" :aria-label="locale === 'en' ? 'Cambiar a español' : 'Switch to English'">
          {{ locale === 'en' ? 'ES' : 'EN' }}
        </button>
      </nav>

      <div class="mobile-controls">
        <button class="lang-toggle" @click="toggleLocale">
          {{ locale === 'en' ? 'ES' : 'EN' }}
        </button>
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <nav class="nav-mobile" :class="{ open: mobileOpen }" aria-label="Mobile navigation">
      <a href="#services" @click.prevent="scrollTo('services')">{{ t.nav.services }}</a>
      <a href="#team" @click.prevent="scrollTo('team')">{{ t.nav.team }}</a>
      <a href="#contact" @click.prevent="scrollTo('contact')">{{ t.nav.contact }}</a>
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
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.logo span {
  color: #6366f1;
  font-weight: 500;
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
