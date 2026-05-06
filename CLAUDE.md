# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ramyx Lab landing page — a single-page Vue 3 site for a consulting business. Bilingual (English/Spanish) with a contact form posted to FormSubmit.co. Deployed to GitHub Pages via GitHub Actions on push to `main` (`.github/workflows/deploy.yml`).

## Commands

- `npm run dev` — start Vite dev server (default `http://localhost:5173`)
- `npm run build` — type-check with `vue-tsc -b` then build for production into `dist/`
- `npm run preview` — preview the production build locally (`http://localhost:4173`)

Node 20 (matches CI in `.github/workflows/deploy.yml`). No test runner or linter is configured.

## Architecture

**Stack:** Vue 3 + TypeScript + Vite, `<script setup>` SFCs throughout. No Vue Router or state management library — single-page site with anchor navigation, sections composed directly in `App.vue`.

**Component layout** (`src/components/`):
- `layout/` — AppHeader, AppFooter
- `sections/` — page sections rendered in `App.vue` order: HeroSection, ServicesSection, ProcessSection, TeamSection, SkillsSection, ResearchSection, CtaBanner, ContactSection. `ProcessSection` is a self-contained interactive showcase of the Client Value Delivery Framework (4-phase stepper with active-phase detail panel + governance band + 3 service-modality cards); all copy lives under `t.process.*` in the i18n dictionaries — note the data key is still named `stages` for historical reasons but the UI labels them as the 4 phases. The source-of-truth for the framework content is `docs/Client_Value_Delivery_Framework_Agentic_AMR.pdf`; the on-site copy is a marketing-friendly consolidation of the 7-stage source.
- `ui/` — reusable presentational pieces (ContactForm, PrimaryButton, SectionTitle, ServiceCard, TeamCard, ParticleCanvas, ResearchCard, ResearchModal)

**Research module** (`src/research/`): blog-style entries shown in the Research section. Each post is a JSON file under `src/research/posts/` and is auto-discovered at build time via `import.meta.glob` in `src/research/index.ts` — drop a new file, ship, it appears (newest first by `date`). `authors.ts` is a small registry (`name`, `image`, `role` per locale) that posts reference by key. `types.ts` defines `PostFile`/`Post`. To add a post: copy an existing `posts/*.json`, set `date` (ISO `YYYY-MM-DD`), `author` (key from `authors.ts`), and the bilingual `title`/`excerpt`/`body` (body is an array of paragraphs per locale). `body` paragraphs render as `<p>` blocks in `ResearchModal`; the optional `reference` field renders as a citation footer. Filename convention: `YYYY-MM-DD-slug.json` (purely cosmetic — sort order comes from the `date` field).

**i18n** (`src/i18n/`): a custom `useI18n` composable in `src/i18n/index.ts` (not `src/composables/`) with `en.ts` and `es.ts` dictionaries. Locale is persisted in `localStorage` and also written to `document.documentElement.lang`. All user-facing copy must come from the dictionaries via `t.section.key` — do not hardcode strings in components.

**Contact form** (`src/components/ui/ContactForm.vue`): submits JSON to `https://formsubmit.co/ajax/<hash>`. The hash in the repo is a placeholder — to activate against a real inbox, follow the activation steps in `README.md` ("Formulario de contacto").

**SEO**: meta tags, hreflang, CSP, and JSON-LD (`Organization`, `WebSite`) are in `index.html`. `src/main.ts` additionally injects a `BlogPosting` JSON-LD `<script>` for each research post at boot, so adding a post automatically adds its structured data. `public/robots.txt` is intentionally restrictive — only Googlebot and Bingbot are allowed; AI scrapers and `User-agent: *` are explicitly disallowed. Do not "fix" that. The `noscript` block in `index.html` carries a static summary of services/team/research for non-JS crawlers — keep it in sync with major content changes.

## Deployment notes

- Production canonical domain is `agentic-amr.com` (custom domain on GitHub Pages, see `public/CNAME`). The domain is hardcoded in three places that must stay in sync if it ever changes: `SITE_URL` in `src/main.ts` (used for BlogPosting JSON-LD), the canonical/og:url/hreflang/JSON-LD URLs in `index.html`, and `public/robots.txt` + `public/sitemap.xml`.
- Vite `base` is `'/'` (see `vite.config.ts`). If you ever deploy to a subpath (e.g. `username.github.io/landingpage_AMR/`), set `base` accordingly **and** update all the URLs above to match.
- Because it's a SPA, any non-GitHub-Pages static host needs a fallback rewrite of unknown paths to `index.html` (Nginx `try_files`, Apache `.htaccess`, S3 error document, etc. — see `README.md` for sample configs).

## Static assets

Team photos and other public-served images live in `public/` (e.g. `angel.jpg`, `marxjhony.jpeg`, `ricardo.jpeg`) and are referenced with absolute paths — they are copied verbatim, **not** hashed by Vite. Source images should be sized close to their max display size (team avatars render at 180×180 CSS, so ~400×400 source is enough); don't drop in 1024×1024 originals. SEO/meta files (`favicon.svg`, `robots.txt`, `sitemap.xml`, `CNAME`) also live in `public/`.

## Performance notes

- `ParticleCanvas` (hero background, runs an rAF loop) is loaded via `defineAsyncComponent` and gated on `prefers-reduced-motion` + `requestIdleCallback` in `HeroSection.vue` so it doesn't block initial paint. Don't switch it back to a static import.
- `ResearchModal` is also async-imported in `ResearchSection.vue` so the modal code only loads when a card is clicked.
