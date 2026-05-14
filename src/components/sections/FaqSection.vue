<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'

const { t } = useI18n()
const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section id="faq" class="faq">
    <div class="container">
      <SectionTitle :title="t.faq.title" :subtitle="t.faq.subtitle" />
      <div class="list">
        <details
          v-for="(item, i) in t.faq.items"
          :key="i"
          :open="openIndex === i"
          @toggle="(e) => { if ((e.target as HTMLDetailsElement).open) openIndex = i }"
        >
          <summary @click.prevent="toggle(i)">
            <span class="question">{{ item.q }}</span>
            <span class="indicator" :class="{ open: openIndex === i }" aria-hidden="true">+</span>
          </summary>
          <p class="answer">{{ item.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding: 5rem 1.5rem;
  background: #f8fafc;
}

.container {
  max-width: 820px;
  margin: 0 auto;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

details {
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

details[open] {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.08);
}

summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.4;
}

summary::-webkit-details-marker {
  display: none;
}

summary:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.question {
  flex: 1;
}

.indicator {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.indicator.open {
  transform: rotate(45deg);
}

.answer {
  padding: 0 1.25rem 1.25rem;
  color: #475569;
  line-height: 1.65;
  font-size: 0.95rem;
  margin: 0;
}

@media (max-width: 600px) {
  summary {
    font-size: 0.95rem;
    padding: 1rem;
  }

  .answer {
    padding: 0 1rem 1rem;
  }
}
</style>
