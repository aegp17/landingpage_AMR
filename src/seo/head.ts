import { useHead } from '@unhead/vue'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { Locale } from '../i18n'
import {
  OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  altLocale,
  homePath,
  ogLocale,
} from './site'

export interface RouteHeadInput {
  locale: Locale
  path: string
  altPath: string
  title: string
  description: string
  ogType?: 'website' | 'article'
  extraScripts?: Record<string, unknown>[]
}

/**
 * Centralized per-route head injection: title, description, OG, Twitter,
 * canonical, hreflang, and a list of JSON-LD scripts. Each page calls this
 * once with a reactive input describing its current state.
 */
export function useRouteHead(input: MaybeRefOrGetter<RouteHeadInput>) {
  const data = computed(() => toValue(input))

  useHead(() => {
    const d = data.value
    const canonical = absoluteUrl(d.path)
    const altUrl = absoluteUrl(d.altPath)
    const enUrl = d.locale === 'en' ? canonical : altUrl
    const ogType = d.ogType ?? 'website'

    const link = [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'es', href: d.locale === 'es' ? canonical : altUrl },
      { rel: 'alternate', hreflang: 'x-default', href: enUrl },
    ]

    const meta = [
      { name: 'description', content: d.description },
      { property: 'og:type', content: ogType },
      { property: 'og:title', content: d.title },
      { property: 'og:description', content: d.description },
      { property: 'og:url', content: canonical },
      { property: 'og:site_name', content: 'Agentic-AMR Consultants' },
      { property: 'og:locale', content: ogLocale(d.locale) },
      { property: 'og:locale:alternate', content: ogLocale(altLocale(d.locale)) },
      { property: 'og:image', content: OG_IMAGE },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: d.title },
      { name: 'twitter:description', content: d.description },
      { name: 'twitter:image', content: OG_IMAGE },
    ]

    const script = (d.extraScripts ?? []).map((json) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(json),
    }))

    return {
      htmlAttrs: { lang: d.locale },
      title: d.title,
      meta,
      link,
      script,
    }
  })
}

const PERSONS = [
  {
    id: `${SITE_URL}/#person-marxjhony`,
    name: 'Marxjhony Jerez',
    jobTitle: 'CEO',
    linkedin: 'https://www.linkedin.com/in/marxjhonyjerez/',
  },
  {
    id: `${SITE_URL}/#person-angel`,
    name: 'Angel Gil',
    jobTitle: 'COO',
    linkedin: 'https://www.linkedin.com/in/angeleduardogil/',
  },
  {
    id: `${SITE_URL}/#person-ricardo`,
    name: 'Ricardo Dos Santos',
    jobTitle: 'CTO',
    linkedin: 'https://www.linkedin.com/in/ricardojdsg/',
  },
] as const

export function personSchemas() {
  return PERSONS.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': p.id,
    name: p.name,
    jobTitle: p.jobTitle,
    worksFor: { '@id': `${SITE_URL}/#organization` },
    sameAs: [p.linkedin],
  }))
}

export function homeJsonLd() {
  const personRefs = PERSONS.map((p) => ({ '@id': p.id }))

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: 'Agentic-AMR Consultants',
    alternateName: 'Ramyx Lab',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    image: OG_IMAGE,
    description:
      'AI and software consulting. We design, build, and deploy intelligent solutions for real businesses.',
    knowsAbout: [
      'Artificial Intelligence',
      'Software Development',
      'Process Automation',
      'Data Analytics',
      'Digital Strategy',
      'Machine Learning',
      'LLMs',
      'Generative AI',
      'DevOps',
      'Cloud Architecture',
    ],
    knowsLanguage: ['en', 'es'],
    areaServed: [
      'Spain',
      'Mexico',
      'Colombia',
      'Venezuela',
      'Argentina',
      'Chile',
      'Peru',
      'United States',
      'Worldwide',
    ],
    serviceType: [
      'AI Consulting',
      'Software Development Consulting',
      'Specialized Training',
      'Process Automation',
    ],
    founder: personRefs,
    employee: personRefs,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: 'Agentic-AMR Consultants',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'es'],
  }

  return [organization, website, ...personSchemas()]
}

export interface FaqItem {
  q: string
  a: string
}

export function faqJsonLd(locale: Locale, items: ReadonlyArray<FaqItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}${homePath(locale)}#faq`,
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function postJsonLd(args: {
  locale: Locale
  postId: string
  postUrl: string
  altUrl: string
  title: string
  description: string
  datePublished: string
  authorName: string
  authorRole: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${args.postUrl}#post`,
    headline: args.title,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.datePublished,
    inLanguage: args.locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.postUrl },
    url: args.postUrl,
    image: OG_IMAGE,
    author: {
      '@type': 'Person',
      name: args.authorName,
      jobTitle: args.authorRole,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export { homePath }
