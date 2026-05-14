/**
 * generate-assets.mjs
 *
 * One-off generator for static assets that should be regenerable from source:
 *   - public/og-image.png   (1200x630)   Open Graph preview
 *   - public/logo.png       (512x512)    PNG version of favicon.svg for Org JSON-LD logo
 *   - public/<name>.webp                 WebP versions of team photo JPEGs
 *
 * Usage:
 *   node scripts/generate-assets.mjs
 *
 * Requires `sharp` (devDependency).
 */

import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const publicDir = path.join(repoRoot, 'public')

/* ----------------------------- og-image.png ----------------------------- */

async function generateOgImage() {
  const width = 1200
  const height = 630

  // Minimal dark-bg OG card with two stacked lines + subtle indigo accent circle.
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0f172a" />

  <!-- Subtle indigo accent circle, top-right -->
  <circle cx="1050" cy="120" r="280" fill="url(#glow)" />
  <circle cx="1050" cy="120" r="60" fill="#6366f1" fill-opacity="0.18" />
  <circle cx="1050" cy="120" r="22" fill="#6366f1" fill-opacity="0.55" />

  <!-- Faint border accent line bottom -->
  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="#6366f1" />

  <!-- Headline -->
  <text x="${width / 2}" y="300"
        font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
        font-size="64" font-weight="800"
        fill="#ffffff" text-anchor="middle"
        letter-spacing="-1.5">Agentic-AMR Consultants</text>

  <!-- Sub-headline -->
  <text x="${width / 2}" y="380"
        font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
        font-size="40" font-weight="600"
        fill="#6366f1" text-anchor="middle"
        letter-spacing="-0.5">AI &amp; Software Consulting</text>
</svg>
`.trim()

  const outPath = path.join(publicDir, 'og-image.png')
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  const meta = await sharp(outPath).metadata()
  console.log(`[og-image] wrote ${outPath} (${meta.width}x${meta.height})`)
}

/* ------------------------------ logo.png ------------------------------- */

async function generateLogoPng() {
  // Render the existing favicon.svg out at 512x512 with transparent background.
  // The source SVG has a filled rounded-rect background; that is fine for a logo PNG.
  const svgPath = path.join(publicDir, 'favicon.svg')
  const svgBuffer = await readFile(svgPath)

  const outPath = path.join(publicDir, 'logo.png')
  await sharp(svgBuffer, { density: 512 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath)

  const meta = await sharp(outPath).metadata()
  console.log(`[logo] wrote ${outPath} (${meta.width}x${meta.height})`)
}

/* ------------------------------- webp ---------------------------------- */

const teamPhotos = [
  { src: 'angel.jpg', out: 'angel.webp' },
  { src: 'marxjhony.jpeg', out: 'marxjhony.webp' },
  { src: 'ricardo.jpeg', out: 'ricardo.webp' },
]

async function generateWebpVariants() {
  for (const { src, out } of teamPhotos) {
    const srcPath = path.join(publicDir, src)
    const outPath = path.join(publicDir, out)
    await sharp(srcPath).webp({ quality: 82 }).toFile(outPath)
    const meta = await sharp(outPath).metadata()
    console.log(`[webp] ${src} -> ${out} (${meta.width}x${meta.height})`)
  }
}

/* ------------------------------- run ----------------------------------- */

await generateOgImage()
await generateLogoPng()
await generateWebpVariants()

console.log('\nAll assets generated.')
