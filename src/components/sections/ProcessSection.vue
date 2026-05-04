<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../../i18n'
import PrimaryButton from '../ui/PrimaryButton.vue'

const { t } = useI18n()

const activeIndex = ref(0)
const activeStage = computed(() => t.value.process.stages[activeIndex.value])

const phaseOf = (id: string) => t.value.process.phases.find((p) => p.id === id)
const phaseTagOf = (id: string) => phaseOf(id)?.tag ?? ''
const phaseTitleOf = (id: string) => phaseOf(id)?.title ?? ''

function jumpToPhase(phaseId: string) {
  const idx = t.value.process.stages.findIndex((s) => s.phase === phaseId)
  if (idx >= 0) activeIndex.value = idx
}

const activePhaseId = computed(() => activeStage.value.phase)

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="process" class="process">
    <div class="container">
      <header class="header">
        <span class="eyebrow">{{ t.process.eyebrow }}</span>
        <h2 class="title">{{ t.process.title }}</h2>
        <p class="subtitle">{{ t.process.subtitle }}</p>
      </header>

      <!-- Phase pills -->
      <div class="phases" role="tablist" :aria-label="t.process.phasesLabel">
        <button
          v-for="phase in t.process.phases"
          :key="phase.id"
          class="phase-pill"
          :class="{ active: activePhaseId === phase.id }"
          role="tab"
          :aria-selected="activePhaseId === phase.id"
          @click="jumpToPhase(phase.id)"
        >
          <span class="phase-tag">{{ phase.tag }}</span>
          <span class="phase-title">{{ phase.title }}</span>
          <span class="phase-desc">{{ phase.description }}</span>
        </button>
      </div>

      <!-- Stepper -->
      <div class="stepper" role="tablist" :aria-label="t.process.stagesLabel">
        <div class="stepper-track" aria-hidden="true"></div>
        <button
          v-for="(stage, i) in t.process.stages"
          :key="stage.number"
          class="step"
          :class="{
            active: activeIndex === i,
            'phase-discovery': stage.phase === 'discovery',
            'phase-design': stage.phase === 'design',
            'phase-deploy': stage.phase === 'deploy',
          }"
          role="tab"
          :aria-selected="activeIndex === i"
          :aria-label="`${stage.number} — ${stage.title}`"
          @click="activeIndex = i"
        >
          <span class="step-node">
            <span class="step-number">{{ stage.number }}</span>
          </span>
          <span class="step-label">{{ stage.short }}</span>
        </button>
      </div>

      <!-- Detail panel -->
      <article class="detail" :key="activeIndex">
        <div class="detail-head">
          <span class="detail-phase">{{ phaseTagOf(activeStage.phase) }} · {{ phaseTitleOf(activeStage.phase) }}</span>
          <div class="detail-heading">
            <span class="detail-number">{{ activeStage.number }}</span>
            <div>
              <h3 class="detail-title">{{ activeStage.title }}</h3>
              <p class="detail-kicker">{{ activeStage.kicker }}</p>
            </div>
          </div>
        </div>
        <p class="detail-body">{{ activeStage.description }}</p>
        <div class="detail-meta">
          <div class="meta-card">
            <span class="meta-label">{{ t.process.deliverableLabel }}</span>
            <p>{{ activeStage.deliverable }}</p>
          </div>
          <div class="meta-card meta-gate">
            <span class="meta-label">{{ t.process.gateLabel }}</span>
            <p>{{ activeStage.gate }}</p>
          </div>
        </div>
      </article>

      <!-- Governance band -->
      <div class="governance">
        <div class="governance-head">
          <span class="gov-eyebrow">{{ t.process.governance.eyebrow }}</span>
          <h3>{{ t.process.governance.title }}</h3>
          <p>{{ t.process.governance.subtitle }}</p>
        </div>
        <div class="governance-grid">
          <div v-for="pillar in t.process.governance.pillars" :key="pillar.title" class="pillar">
            <span class="pillar-dot" aria-hidden="true"></span>
            <div>
              <h4>{{ pillar.title }}</h4>
              <p>{{ pillar.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Service modalities -->
      <div class="modalities">
        <header class="modalities-head">
          <h3>{{ t.process.modalities.title }}</h3>
          <p>{{ t.process.modalities.subtitle }}</p>
        </header>
        <div class="modalities-grid">
          <article
            v-for="(mod, i) in t.process.modalities.items"
            :key="mod.name"
            class="modality"
            :class="{ featured: i === 1 }"
          >
            <span class="modality-tag">{{ mod.tag }}</span>
            <h4 class="modality-name">{{ mod.name }}</h4>
            <span class="modality-duration">{{ mod.duration }}</span>
            <p class="modality-desc">{{ mod.description }}</p>
            <div class="modality-outcome">
              <span class="outcome-label">{{ mod.outcomeLabel }}</span>
              <p>{{ mod.outcome }}</p>
            </div>
          </article>
        </div>
        <div class="modalities-cta">
          <PrimaryButton @click="scrollToContact">{{ t.process.cta }}</PrimaryButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.process {
  padding: 6rem 1.5rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

.process::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.process::after {
  content: '';
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 3rem;
}

.eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 1.25rem;
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 0.85rem;
}

.subtitle {
  font-size: 1.05rem;
  color: #64748b;
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.65;
}

/* Phase pills */
.phases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 3.5rem;
}

.phase-pill {
  text-align: left;
  padding: 1.25rem 1.4rem;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.14);
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.phase-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(139, 92, 246, 0.02));
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.phase-pill:hover {
  border-color: rgba(99, 102, 241, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.1);
}

.phase-pill.active {
  border-color: #6366f1;
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.18);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, #ffffff 100%);
}

.phase-pill.active::before {
  opacity: 1;
}

.phase-tag {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
  position: relative;
}

.phase-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  position: relative;
}

.phase-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.55;
  position: relative;
}

/* Stepper */
.stepper {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  position: relative;
  margin-bottom: 2.5rem;
  padding: 1rem 0 0.5rem;
}

.stepper-track {
  position: absolute;
  top: calc(1rem + 28px);
  left: 7%;
  right: 7%;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.15) 0%,
    rgba(99, 102, 241, 0.4) 50%,
    rgba(99, 102, 241, 0.15) 100%
  );
  border-radius: 2px;
  z-index: 0;
}

.step {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  font-family: inherit;
  position: relative;
  z-index: 1;
  transition: transform 0.25s ease;
}

.step-node {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #6366f1;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.step-number {
  font-variant-numeric: tabular-nums;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: -0.005em;
  transition: color 0.25s;
  text-align: center;
  max-width: 110px;
  line-height: 1.3;
}

.step:hover .step-node {
  border-color: #6366f1;
  transform: scale(1.05);
  box-shadow: 0 8px 22px rgba(99, 102, 241, 0.18);
}

.step:hover .step-label {
  color: #4f46e5;
}

.step.active .step-node {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: #6366f1;
  color: #fff;
  transform: scale(1.12);
  box-shadow:
    0 0 0 6px rgba(99, 102, 241, 0.12),
    0 12px 30px rgba(99, 102, 241, 0.35);
}

.step.active .step-label {
  color: #4f46e5;
  font-weight: 700;
}

/* Detail panel */
.detail {
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 18px;
  padding: 2rem 2.25rem;
  margin-bottom: 4rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
  animation: fadeUp 0.35s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-head {
  margin-bottom: 1.25rem;
}

.detail-phase {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 1rem;
}

.detail-heading {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.detail-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  flex-shrink: 0;
}

.detail-title {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
  margin: 0 0 0.25rem;
}

.detail-kicker {
  font-size: 0.92rem;
  color: #6366f1;
  font-weight: 500;
  margin: 0;
}

.detail-body {
  font-size: 1rem;
  color: #475569;
  line-height: 1.7;
  margin: 0 0 1.75rem;
}

.detail-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.meta-card {
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid #6366f1;
}

.meta-card.meta-gate {
  background: rgba(245, 158, 11, 0.06);
  border-left-color: #f59e0b;
}

.meta-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 0.4rem;
}

.meta-card.meta-gate .meta-label {
  color: #b45309;
}

.meta-card p {
  margin: 0;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.55;
}

/* Governance band */
.governance {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border-radius: 20px;
  padding: 2.75rem 2.5rem;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
}

.governance::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.governance-head {
  text-align: center;
  margin-bottom: 2.25rem;
  position: relative;
}

.gov-eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a5b4fc;
  margin-bottom: 0.85rem;
}

.governance-head h3 {
  font-size: 1.55rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.015em;
  margin: 0 0 0.5rem;
}

.governance-head p {
  font-size: 0.98rem;
  color: rgba(226, 232, 240, 0.78);
  margin: 0;
  max-width: 560px;
  margin: 0 auto;
}

.governance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  position: relative;
}

.pillar {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.25s, border-color 0.25s, transform 0.25s;
}

.pillar:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(165, 180, 252, 0.3);
  transform: translateY(-2px);
}

.pillar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
  margin-top: 0.45rem;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(165, 180, 252, 0.5);
}

.pillar h4 {
  font-size: 0.92rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.2rem;
  letter-spacing: -0.005em;
}

.pillar p {
  font-size: 0.82rem;
  color: rgba(226, 232, 240, 0.72);
  margin: 0;
  line-height: 1.5;
}

/* Modalities */
.modalities-head {
  text-align: center;
  margin-bottom: 2rem;
}

.modalities-head h3 {
  font-size: 1.55rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
  margin: 0 0 0.5rem;
}

.modalities-head p {
  font-size: 0.98rem;
  color: #64748b;
  margin: 0;
  max-width: 560px;
  margin: 0 auto;
}

.modalities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.25rem;
}

.modality {
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.14);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
  position: relative;
}

.modality:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 16px 36px rgba(99, 102, 241, 0.1);
}

.modality.featured {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.12);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, #ffffff 100%);
}

.modality-tag {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
}

.modality-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.modality-duration {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.08);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  align-self: flex-start;
}

.modality-desc {
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.6;
  margin: 0.25rem 0 0.5rem;
}

.modality-outcome {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(99, 102, 241, 0.12);
}

.outcome-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 0.35rem;
}

.modality-outcome p {
  margin: 0;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.55;
}

.modalities-cta {
  text-align: center;
}

/* Tablet */
@media (max-width: 960px) {
  .phases {
    grid-template-columns: 1fr;
  }

  .stepper {
    grid-template-columns: repeat(7, minmax(72px, 1fr));
    overflow-x: auto;
    padding: 1rem 0.5rem 1rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .step {
    scroll-snap-align: center;
  }

  .stepper-track {
    left: 10%;
    right: 10%;
  }

  .governance-grid,
  .modalities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .process {
    padding: 4rem 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .stepper {
    grid-template-columns: repeat(7, minmax(64px, 1fr));
  }

  .step-node {
    width: 48px;
    height: 48px;
    font-size: 0.85rem;
  }

  .stepper-track {
    top: calc(1rem + 24px);
  }

  .step-label {
    font-size: 0.72rem;
    max-width: 80px;
  }

  .detail {
    padding: 1.5rem 1.25rem;
    border-radius: 14px;
  }

  .detail-heading {
    gap: 0.85rem;
  }

  .detail-number {
    font-size: 2rem;
  }

  .detail-title {
    font-size: 1.2rem;
  }

  .detail-meta {
    grid-template-columns: 1fr;
  }

  .governance {
    padding: 2rem 1.25rem;
    border-radius: 16px;
  }

  .governance-grid {
    grid-template-columns: 1fr;
  }

  .modalities-grid {
    grid-template-columns: 1fr;
  }

  .modality {
    padding: 1.5rem 1.25rem;
  }
}
</style>
