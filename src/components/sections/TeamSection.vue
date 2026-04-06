<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'
import TeamCard from '../ui/TeamCard.vue'

const { t } = useI18n()

const placeholderImages = [
  'https://api.dicebear.com/9.x/initials/svg?seed=MJ&backgroundColor=7faedb&textColor=ffffff',
  'https://api.dicebear.com/9.x/initials/svg?seed=AG&backgroundColor=a9c7e8&textColor=ffffff',
  'https://api.dicebear.com/9.x/initials/svg?seed=RD&backgroundColor=6a9dcf&textColor=ffffff',
]
</script>

<template>
  <section id="team" class="team">
    <div class="container">
      <SectionTitle :title="t.team.title" :subtitle="t.team.subtitle" />
      <div class="grid">
        <TeamCard
          v-for="(member, i) in t.team.members"
          :key="i"
          :name="member.name"
          :role="member.role"
          :description="member.description"
          :skills="member.skills"
          :image="placeholderImages[i]"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.team {
  padding: 5rem 1.5rem;
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
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
