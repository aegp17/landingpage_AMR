<script setup lang="ts">
import { defineAsyncComponent, ref, onMounted } from 'vue'
import { useI18n } from '../../i18n'
import PrimaryButton from '../ui/PrimaryButton.vue'

const ParticleCanvas = defineAsyncComponent(() => import('../ui/ParticleCanvas.vue'))

const { t } = useI18n()
const showCanvas = ref(false)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback
  if (idle) idle(() => (showCanvas.value = true), { timeout: 800 })
  else setTimeout(() => (showCanvas.value = true), 200)
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="hero" class="hero">
    <div class="hero-inner">
      <h1>{{ t.hero.title }}</h1>
      <p class="subtitle">{{ t.hero.subtitle }}</p>
      <div class="cta-group">
        <PrimaryButton @click="scrollTo('contact')">{{ t.hero.cta }}</PrimaryButton>
        <PrimaryButton variant="secondary" @click="scrollTo('team')">{{ t.hero.ctaSecondary }}</PrimaryButton>
      </div>
    </div>
    <ParticleCanvas v-if="showCanvas" />
    <div class="hero-decoration" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 6rem 1.5rem 4rem;
}

.hero-inner {
  max-width: 720px;
  text-align: center;
  position: relative;
  z-index: 1;
}

h1 {
  font-size: 2.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}

.subtitle {
  font-size: 1.15rem;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 2.25rem;
}

.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-decoration {
  position: absolute;
  top: -20%;
  right: -15%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
