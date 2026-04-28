<script setup lang="ts">
import { useI18n } from '../../i18n'
import PrimaryButton from '../ui/PrimaryButton.vue'

const { t } = useI18n()

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="cta-banner" aria-labelledby="cta-banner-title">
    <div class="container">
      <div class="content">
        <h2 id="cta-banner-title">{{ t.ctaBanner.title }}</h2>
        <p>{{ t.ctaBanner.subtitle }}</p>
      </div>
      <PrimaryButton class="cta-action" @click="scrollToContact">
        {{ t.ctaBanner.cta }}
      </PrimaryButton>
    </div>
  </section>
</template>

<style scoped>
.cta-banner {
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.cta-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  position: relative;
  z-index: 1;
}

.content {
  flex: 1;
  min-width: 0;
}

.content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
}

.content p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  max-width: 560px;
}

.cta-action {
  flex-shrink: 0;
  background: #fff !important;
  color: #4f46e5 !important;
  border-color: #fff !important;
}

.cta-action:hover {
  background: #f8fafc !important;
  border-color: #f8fafc !important;
  color: #4338ca !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18) !important;
}

@media (max-width: 768px) {
  .cta-banner {
    padding: 3rem 1.5rem;
  }

  .container {
    flex-direction: column;
    text-align: center;
    gap: 1.75rem;
  }

  .content h2 {
    font-size: 1.5rem;
  }

  .content p {
    margin: 0 auto;
  }
}
</style>
