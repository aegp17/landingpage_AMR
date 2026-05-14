<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'
import TeamCard from '../ui/TeamCard.vue'

const { t } = useI18n()

const teamProfiles = [
  { image: '/marxjhony.jpeg', linkedin: 'https://www.linkedin.com/in/marxjhonyjerez/' },
  { image: '/angel.jpg', linkedin: 'https://www.linkedin.com/in/angeleduardogil/' },
  { image: '/ricardo.jpeg', linkedin: 'https://www.linkedin.com/in/ricardojdsg/' },
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
          :image="teamProfiles[i].image"
          :linkedin="teamProfiles[i].linkedin"
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
