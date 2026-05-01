import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { posts, authors } from './research'

const SITE_URL = 'https://agentic-amr.com'

const storedLocale = localStorage.getItem('locale')
if (storedLocale === 'es') {
  document.documentElement.lang = 'es'
}

function injectArticleSchema() {
  for (const post of posts) {
    const author = authors[post.author]
    if (!author) continue
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title.en,
      alternativeHeadline: post.title.es,
      description: post.excerpt.en,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: ['en', 'es'],
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/#research` },
      author: {
        '@type': 'Person',
        name: author.name,
        jobTitle: author.role.en,
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
      url: `${SITE_URL}/#research`,
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.postId = post.id
    script.textContent = JSON.stringify(ld)
    document.head.appendChild(script)
  }
}

injectArticleSchema()

createApp(App).mount('#app')
