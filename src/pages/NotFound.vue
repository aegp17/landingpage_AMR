<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useRouteHead } from '../seo/head'
import { homePath } from '../seo/site'

const { locale, t } = useI18n()

const titles: Record<'en' | 'es', string> = {
  en: 'Page not found | Agentic-AMR Consultants',
  es: 'Página no encontrada | Agentic-AMR Consultants',
}
const descriptions: Record<'en' | 'es', string> = {
  en: 'The page you were looking for does not exist.',
  es: 'La página que buscas no existe.',
}
const labels: Record<'en' | 'es', { heading: string; body: string }> = {
  en: {
    heading: '404 — Page not found',
    body: "The page you're looking for doesn't exist or was moved.",
  },
  es: {
    heading: '404 — Página no encontrada',
    body: 'La página que buscas no existe o fue movida.',
  },
}

useRouteHead(
  computed(() => ({
    locale: locale.value,
    path: homePath(locale.value),
    altPath: homePath(locale.value === 'en' ? 'es' : 'en'),
    title: titles[locale.value],
    description: descriptions[locale.value],
    ogType: 'website' as const,
    extraScripts: [],
  })),
)
</script>

<template>
  <main class="not-found">
    <div class="inner">
      <h1>{{ labels[locale].heading }}</h1>
      <p>{{ labels[locale].body }}</p>
      <router-link :to="homePath(locale)" class="back">← {{ t.research.back }}</router-link>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7rem 1.5rem 4rem;
}

.inner {
  max-width: 480px;
  text-align: center;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem;
}

p {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.back {
  display: inline-block;
  background: #6366f1;
  color: #fff;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.back:hover {
  background: #4f46e5;
}
</style>
