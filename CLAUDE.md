# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ramyx Lab landing page — a single-page Vue 3 site for a consulting business. Bilingual (English/Spanish) with a contact form powered by EmailJS. Deployed to GitHub Pages via GitHub Actions on push to `main`.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check with vue-tsc then build for production
- `npm run preview` — preview the production build locally

No test runner or linter is configured.

## Architecture

**Stack:** Vue 3 + TypeScript + Vite. Uses `<script setup>` SFCs throughout. No Vue Router or state management library — it's a single-page site with anchor navigation.

**Component structure** (`src/components/`):
- `layout/` — AppHeader, AppFooter (site chrome)
- `sections/` — HeroSection, ServicesSection, TeamSection, ContactSection (page sections composed in App.vue)
- `ui/` — reusable presentational components (ContactForm, PrimaryButton, SectionTitle, ServiceCard, TeamCard)

**i18n** (`src/i18n/`): Custom composable (`useI18n`) with `en.ts` and `es.ts` translation files. Locale stored in localStorage. All user-facing text comes from translation objects accessed via `t.section.key`.

**Deployment:** Vite base path is `/landingpage_AMR/`. GitHub Actions workflow builds and deploys to GitHub Pages on push to `main`.

**Static assets:** Team photos in `src/assets/`, SVG icons/favicon in `public/`.
