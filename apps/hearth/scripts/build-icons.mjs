// Renders the PNG icons from icons/icon.svg. Run from the repo root after
// editing the SVG:  node apps/hearth/scripts/build-icons.mjs
// Uses `sharp`, already a devDependency of the landing page.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const icons = fileURLToPath(new URL('../site/icons/', import.meta.url))
const svg = readFileSync(`${icons}icon.svg`)

const render = (size) => sharp(svg, { density: 384 }).resize(size, size)

await render(192).png().toFile(`${icons}icon-192.png`)
await render(512).png().toFile(`${icons}icon-512.png`)

// iOS draws its own rounded corners and dislikes transparency: square, full bleed.
const square = Buffer.from(
  svg.toString().replace(/<rect([^>]*) rx="\d+"/, '<rect$1'),
)
await sharp(square, { density: 384 }).resize(180, 180).flatten({ background: '#cc6340' }).png().toFile(`${icons}apple-touch-icon.png`)

// Maskable: full-bleed background, flame shrunk into the 80% safe zone.
const maskable = Buffer.from(
  svg
    .toString()
    .replace(/<rect([^>]*) rx="\d+"/, '<rect$1')
    .replace(/(<path fill="#fff6ea")/, '<g transform="translate(256 256) scale(0.78) translate(-256 -264)">$1')
    .replace(/<\/svg>/, '</g></svg>'),
)
await sharp(maskable, { density: 384 }).resize(512, 512).png().toFile(`${icons}icon-maskable-512.png`)

console.log('icons written to', icons)
