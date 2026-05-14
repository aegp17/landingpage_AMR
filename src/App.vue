<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { localeFromPath } from './i18n'

const route = useRoute()

// Keep <html lang> in sync on the client. useHead already does this per-route,
// but on the very first paint (before the page-level useHead runs) we'd flash
// the wrong value if the static HTML didn't already match. vite-ssg renders the
// correct lang per route, so this is mostly a safety net for client nav.
if (typeof document !== 'undefined') {
  watch(
    () => route.path,
    (p) => {
      document.documentElement.lang = localeFromPath(p)
    },
    { immediate: true },
  )
}
</script>

<template>
  <AppHeader />
  <router-view />
  <AppFooter />
</template>
