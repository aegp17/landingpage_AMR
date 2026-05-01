<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import type { AuthorMeta, Locale, Post } from '../../research'

const props = defineProps<{
  post: Post
  author: AuthorMeta
  locale: Locale
  closeLabel: string
  referenceLabel: string
  ctaTitle: string
  ctaSubtitle: string
  ctaButton: string
}>()

const emit = defineEmits<{ close: []; contact: [] }>()

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

watch(
  () => props.post.id,
  () => {
    const dialog = document.querySelector('.research-modal-dialog') as HTMLElement | null
    dialog?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="research-modal-overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
    <div class="research-modal-dialog">
      <button class="close-btn" @click="emit('close')" :aria-label="closeLabel">×</button>
      <header class="header">
        <div class="byline">
          <img :src="author.image" :alt="author.name" class="avatar" width="48" height="48" />
          <div>
            <div class="name">{{ author.name }}</div>
            <div class="role">{{ author.role[locale] }} · {{ formatDate(post.date, locale) }}</div>
          </div>
        </div>
        <h2>{{ post.title[locale] }}</h2>
      </header>
      <div class="body">
        <p v-for="(para, i) in post.body[locale]" :key="i">{{ para }}</p>
      </div>
      <footer v-if="post.reference" class="reference">
        <div class="reference-label">{{ referenceLabel }}</div>
        <p>{{ post.reference[locale] }}</p>
      </footer>

      <aside class="cta">
        <div class="cta-text">
          <h3>{{ ctaTitle }}</h3>
          <p>{{ ctaSubtitle }}</p>
        </div>
        <button type="button" class="cta-button" @click="emit('contact')">
          {{ ctaButton }} →
        </button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.research-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fade-in 0.2s ease;
}

.research-modal-dialog {
  background: #fff;
  border-radius: 16px;
  max-width: 760px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2.5rem;
  position: relative;
  animation: slide-up 0.25s ease;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(99, 102, 241, 0.08);
  color: #0f172a;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(99, 102, 241, 0.18);
}

.header {
  margin-bottom: 1.75rem;
  padding-right: 2.5rem;
}

.byline {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.25);
}

.name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.role {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.1rem;
}

h2 {
  font-size: 1.65rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin: 0;
}

.body p {
  font-size: 0.98rem;
  color: #334155;
  line-height: 1.75;
  margin: 0 0 1.1rem;
}

.body p:last-child {
  margin-bottom: 0;
}

.reference {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(99, 102, 241, 0.15);
}

.reference-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.reference p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

.cta {
  margin-top: 2rem;
  padding: 1.5rem 1.75rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.cta-text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.3rem;
}

.cta-text p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.cta-button {
  flex-shrink: 0;
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.cta-button:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .research-modal-overlay {
    padding: 0;
  }

  .research-modal-dialog {
    border-radius: 0;
    max-height: 100vh;
    padding: 2rem 1.25rem;
  }

  h2 {
    font-size: 1.35rem;
  }

  .cta {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>
