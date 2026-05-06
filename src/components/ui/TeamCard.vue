<script setup lang="ts">
defineProps<{
  name: string
  role: string
  description: string
  skills: string[]
  image: string
  linkedin?: string
}>()
</script>

<template>
  <div class="team-card">
    <div class="avatar">
      <img :src="image" :alt="name" width="180" height="180" loading="lazy" />
    </div>
    <h3>{{ name }}</h3>
    <p class="role">{{ role }}</p>
    <p class="description">{{ description }}</p>
    <div class="skills">
      <span v-for="skill in skills" :key="skill" class="skill-tag">{{ skill }}</span>
    </div>
    <a
      v-if="linkedin"
      class="linkedin"
      :href="linkedin"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`LinkedIn — ${name}`"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.55V9h3.57zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0"/>
      </svg>
      <span>LinkedIn</span>
    </a>
  </div>
</template>

<style scoped>
.team-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  transition: all 0.3s;
}

.team-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.1);
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto 1.25rem;
  background: rgba(99, 102, 241, 0.06);
  border: 3px solid rgba(99, 102, 241, 0.25);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.role {
  font-size: 0.85rem;
  color: #6366f1;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.description {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}

.skill-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-weight: 500;
}

.linkedin {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.25rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #0a66c2;
  background: rgba(10, 102, 194, 0.08);
  border: 1px solid rgba(10, 102, 194, 0.18);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.linkedin:hover,
.linkedin:focus-visible {
  background: rgba(10, 102, 194, 0.14);
  border-color: rgba(10, 102, 194, 0.32);
  transform: translateY(-1px);
}

.linkedin:focus-visible {
  outline: 2px solid #0a66c2;
  outline-offset: 2px;
}

.linkedin svg {
  flex-shrink: 0;
}
</style>
