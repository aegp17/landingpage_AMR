<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'
import ServiceCard from '../ui/ServiceCard.vue'

const { t } = useI18n()

const icons = [
  // Code / Software
  `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  // Brain / AI
  `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>`,
  // Graduation / Training
  `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
]
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <SectionTitle :title="t.services.title" :subtitle="t.services.subtitle" />
      <div class="grid">
        <ServiceCard
          v-for="(service, i) in t.services.items"
          :key="i"
          :title="service.title"
          :description="service.description"
          :details="service.details"
          :icon="icons[i]"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  padding: 5rem 1.5rem;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>
