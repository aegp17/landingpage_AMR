<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'
import ServiceCard from '../ui/ServiceCard.vue'

const { t } = useI18n()

const iconIds = ['icon-code', 'icon-brain', 'icon-graduation']
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
          :icon-id="iconIds[i]"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  padding: 5rem 1.5rem;
  background: #f8fafc;
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
