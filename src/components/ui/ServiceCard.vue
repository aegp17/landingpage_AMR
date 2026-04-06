<script setup lang="ts">
defineProps<{
  title: string
  description: string
  details: string[]
  icon: string
}>()
</script>

<template>
  <div class="service-card">
    <div class="icon-wrap">
      <span class="icon" v-html="icon"></span>
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
  border: 1px solid rgba(169, 199, 232, 0.25);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s;
}

.service-card:hover {
  border-color: #a9c7e8;
  box-shadow: 0 8px 30px rgba(169, 199, 232, 0.15);
  transform: translateY(-2px);
}

.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(169, 199, 232, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.icon {
  font-size: 1.4rem;
  color: #7faedb;
}

h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

p {
  font-size: 0.9rem;
  color: #6b7280;
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
  color: #6b7280;
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
  background: #a9c7e8;
}
</style>
