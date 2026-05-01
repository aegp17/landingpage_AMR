# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ramyx Lab landing page — a single-page Vue 3 site for a consulting business. Bilingual (English/Spanish) with a contact form posted to FormSubmit.co. Deployed to GitHub Pages via GitHub Actions on push to `main` (`.github/workflows/deploy.yml`).

## Commands

- `npm run dev` — start Vite dev server (default `http://localhost:5173`)
- `npm run build` — type-check with `vue-tsc -b` then build for production into `dist/`
- `npm run preview` — preview the production build locally (`http://localhost:4173`)

No test runner or linter is configured.

## Architecture

**Stack:** Vue 3 + TypeScript + Vite, `<script setup>` SFCs throughout. No Vue Router or state management library — single-page site with anchor navigation, sections composed directly in `App.vue`.

**Component layout** (`src/components/`):
- `layout/` — AppHeader, AppFooter
- `sections/` — page sections rendered in `App.vue` order: HeroSection, ServicesSection, TeamSection, SkillsSection, ResearchSection, CtaBanner, ContactSection
- `ui/` — reusable presentational pieces (ContactForm, PrimaryButton, SectionTitle, ServiceCard, TeamCard, ParticleCanvas, ResearchCard, ResearchModal)

**Research module** (`src/research/`): blog-style entries shown in the Research section. Each post is a JSON file under `src/research/posts/` and is auto-discovered at build time via `import.meta.glob` in `src/research/index.ts` — drop a new file, ship, it appears (newest first by `date`). `authors.ts` is a small registry (`name`, `image`, `role` per locale) that posts reference by key. `types.ts` defines `PostFile`/`Post`. To add a post: copy an existing `posts/*.json`, set `date` (ISO `YYYY-MM-DD`), `author` (key from `authors.ts`), and the bilingual `title`/`excerpt`/`body` (body is an array of paragraphs per locale). `body` paragraphs render as `<p>` blocks in `ResearchModal`; the optional `reference` field renders as a citation footer. Filename convention: `YYYY-MM-DD-slug.json` (purely cosmetic — sort order comes from the `date` field).

**i18n** (`src/i18n/`): a custom `useI18n` composable in `index.ts` with `en.ts` and `es.ts` dictionaries. Locale is persisted in `localStorage` and also written to `document.documentElement.lang`. All user-facing copy must come from the dictionaries via `t.section.key` — do not hardcode strings in components. (Note: despite the name, this composable lives in `src/i18n/`, not `src/composables/`.)

**Contact form** (`src/components/ui/ContactForm.vue`): submits JSON to `https://formsubmit.co/ajax/<hash>`. The hash in the repo is a placeholder — to activate against a real inbox, follow the activation steps in `README.md` ("Formulario de contacto").

**SEO**: meta tags, hreflang, CSP, and JSON-LD (`Organization`, `WebSite`) are in `index.html`. `src/main.ts` additionally injects a `BlogPosting` JSON-LD `<script>` for each research post at boot, so adding a post automatically adds its structured data. `public/robots.txt` is intentionally restrictive — only Googlebot and Bingbot are allowed; AI scrapers and `User-agent: *` are explicitly disallowed. Do not "fix" that. The `noscript` block in `index.html` carries a static summary of services/team/research for non-JS crawlers — keep it in sync with major content changes.

## Deployment notes

- Vite `base` is `'/'` (see `vite.config.ts`). The GitHub Pages workflow uses a custom domain, so root-relative URLs work. If you ever deploy to a subpath (e.g. `username.github.io/landingpage_AMR/`), set `base` accordingly **and** update the canonical/og:url/hreflang/sitemap URLs in `index.html`, `public/robots.txt`, and `public/sitemap.xml` to match.
- Because it's a SPA, any non-GitHub-Pages static host needs a fallback rewrite of unknown paths to `index.html` (Nginx `try_files`, Apache `.htaccess`, S3 error document, etc. — see `README.md` for sample configs).

## Static assets

Team photos in `src/assets/` (imported through Vite, hashed at build time). SEO/meta files (`favicon.svg`, `robots.txt`, `sitemap.xml`) live in `public/` and are copied verbatim — reference them with absolute paths.
