<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'
import HeroSection from '../components/sections/HeroSection.vue'
import ServicesSection from '../components/sections/ServicesSection.vue'
import ProcessSection from '../components/sections/ProcessSection.vue'
import TeamSection from '../components/sections/TeamSection.vue'
import SkillsSection from '../components/sections/SkillsSection.vue'
import ResearchSection from '../components/sections/ResearchSection.vue'
import FaqSection from '../components/sections/FaqSection.vue'
import CtaBanner from '../components/sections/CtaBanner.vue'
import ContactSection from '../components/sections/ContactSection.vue'
import { useRouteHead, homeJsonLd, faqJsonLd } from '../seo/head'
import { homePath } from '../seo/site'

const { locale, t } = useI18n()

const titles: Record<'en' | 'es', string> = {
  en: 'AI & Software Consulting | Agentic-AMR Consultants',
  es: 'Consultoría en IA y Software | Agentic-AMR Consultants',
}
const descriptions: Record<'en' | 'es', string> = {
  en: 'AI and software consulting for businesses. We design, build, and deploy intelligent solutions, automations, and scalable products. PhD-led team.',
  es: 'Consultoría en inteligencia artificial y desarrollo de software. Diseñamos, construimos y desplegamos soluciones inteligentes y automatizaciones para empresas.',
}

useRouteHead(
  computed(() => ({
    locale: locale.value,
    path: homePath(locale.value),
    altPath: homePath(locale.value === 'en' ? 'es' : 'en'),
    title: titles[locale.value],
    description: descriptions[locale.value],
    ogType: 'website',
    extraScripts: [...homeJsonLd(), faqJsonLd(locale.value, t.value.faq.items)],
  })),
)
</script>

<template>
  <main>
    <HeroSection />
    <ServicesSection />
    <ProcessSection />
    <TeamSection />
    <SkillsSection />
    <ResearchSection />
    <FaqSection />
    <CtaBanner />
    <ContactSection />
  </main>
</template>
