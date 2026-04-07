<script setup lang="ts">
defineProps<{
  title: string
  description: string
  details: string[]
  iconId: string
}>()

const baseUrl = import.meta.env.BASE_URL
</script>

<template>
  <div class="service-card">
    <div class="icon-wrap">
      <svg class="icon" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <use :href="`${baseUrl}icons.svg#${iconId}`" />
      </svg>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <ul>
      <li v-for="detail in details" :key="detail">{{ detail }}</li>
    </ul>
  </div>
</template>

<style scoped>
.service-card {
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s;
}

.service-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.icon {
  font-size: 1.4rem;
  color: #6366f1;
}

h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65rem;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6366f1;
}
</style>
