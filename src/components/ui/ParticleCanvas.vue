<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
let animationId = 0

interface Particle {
  x: number
  y: number
  r: number
  dx: number
  dy: number
  opacity: number
}

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!
  let particles: Particle[] = []

  function resize() {
    el.width = el.offsetWidth * devicePixelRatio
    el.height = el.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)
  }

  function init() {
    resize()
    const w = el.offsetWidth
    const h = el.offsetHeight
    const count = Math.floor((w * h) / 18000)
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.6,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.25 + 0.05,
    }))
  }

  function draw() {
    const w = el.offsetWidth
    const h = el.offsetHeight
    ctx.clearRect(0, 0, w, h)

    for (const p of particles) {
      p.x += p.dx
      p.y += p.dy

      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`
      ctx.fill()
    }

    // Draw subtle connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.04 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(draw)
  }

  init()
  draw()
  window.addEventListener('resize', init)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', init)
  })
})
</script>

<template>
  <canvas ref="canvas" class="particle-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
