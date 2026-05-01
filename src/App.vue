<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ServicesSection from './components/sections/ServicesSection.vue'
import TeamSection from './components/sections/TeamSection.vue'
import SkillsSection from './components/sections/SkillsSection.vue'
import ResearchSection from './components/sections/ResearchSection.vue'
import CtaBanner from './components/sections/CtaBanner.vue'
import ContactSection from './components/sections/ContactSection.vue'
</script>

<template>
  <AppHeader />
  <main>
    <HeroSection />
    <ServicesSection />
    <TeamSection />
    <SkillsSection />
    <ResearchSection />
    <CtaBanner />
    <ContactSection />
  </main>
  <AppFooter />
</template>
