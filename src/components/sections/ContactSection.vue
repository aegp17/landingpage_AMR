<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'
import ContactForm from '../ui/ContactForm.vue'

const { t } = useI18n()
</script>

<template>
  <section id="contact" class="contact">
    <div class="container">
      <SectionTitle :title="t.contact.title" :subtitle="t.contact.subtitle" />
      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 5rem 1.5rem;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
