<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
let animationId = 0

interface Agent {
  x: number
  y: number
  radius: number
  // movement
  vx: number
  vy: number
  // target point to wander toward
  tx: number
  ty: number
  // visual
  baseOpacity: number
  pulse: number
  pulseSpeed: number
  // behaviour
  tier: 'primary' | 'secondary' | 'minor'
}

interface DataPacket {
  from: Agent
  to: Agent
  progress: number
  speed: number
}

interface Whisper {
  x: number
  y: number
  age: number
  life: number
  peakOpacity: number
}

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!
  let agents: Agent[] = []
  let packets: DataPacket[] = []
  let whispers: Whisper[] = []
  let w = 0
  let h = 0
  let time = 0

  function resize() {
    w = el.offsetWidth
    h = el.offsetHeight
    el.width = w * devicePixelRatio
    el.height = h * devicePixelRatio
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  }

  function randomTarget(): { tx: number; ty: number } {
    return { tx: Math.random() * w, ty: Math.random() * h }
  }

  function init() {
    resize()
    const area = w * h
    const primaryCount = Math.max(3, Math.floor(area / 120000))
    const secondaryCount = Math.max(5, Math.floor(area / 50000))
    const minorCount = Math.max(8, Math.floor(area / 25000))

    agents = []
    packets = []
    whispers = []

    // Primary agents — larger, brighter, slower, represent main orchestrators
    for (let i = 0; i < primaryCount; i++) {
      const t = randomTarget()
      agents.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 3.5 + Math.random() * 1.5,
        vx: 0, vy: 0,
        tx: t.tx, ty: t.ty,
        baseOpacity: 0.35 + Math.random() * 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.01,
        tier: 'primary',
      })
    }

    // Secondary agents — medium, represent worker agents
    for (let i = 0; i < secondaryCount; i++) {
      const t = randomTarget()
      agents.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 2 + Math.random() * 1,
        vx: 0, vy: 0,
        tx: t.tx, ty: t.ty,
        baseOpacity: 0.2 + Math.random() * 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.015,
        tier: 'secondary',
      })
    }

    // Minor agents — small background nodes
    for (let i = 0; i < minorCount; i++) {
      const t = randomTarget()
      agents.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0.8 + Math.random() * 0.8,
        vx: 0, vy: 0,
        tx: t.tx, ty: t.ty,
        baseOpacity: 0.08 + Math.random() * 0.08,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.025 + Math.random() * 0.02,
        tier: 'minor',
      })
    }
  }

  function moveAgents() {
    for (const a of agents) {
      // Wander: steer toward target, pick new target when close
      const dtx = a.tx - a.x
      const dty = a.ty - a.y
      const distToTarget = Math.sqrt(dtx * dtx + dty * dty)

      if (distToTarget < 30) {
        const t = randomTarget()
        a.tx = t.tx
        a.ty = t.ty
      }

      // Gentle steering force
      const speed = a.tier === 'primary' ? 0.08 : a.tier === 'secondary' ? 0.12 : 0.15
      a.vx += (dtx / distToTarget) * speed * 0.05
      a.vy += (dty / distToTarget) * speed * 0.05

      // Damping
      a.vx *= 0.98
      a.vy *= 0.98

      // Clamp max speed
      const maxSpeed = speed
      const currentSpeed = Math.sqrt(a.vx * a.vx + a.vy * a.vy)
      if (currentSpeed > maxSpeed) {
        a.vx = (a.vx / currentSpeed) * maxSpeed
        a.vy = (a.vy / currentSpeed) * maxSpeed
      }

      a.x += a.vx
      a.y += a.vy

      // Wrap edges softly
      if (a.x < -20) a.x = w + 20
      if (a.x > w + 20) a.x = -20
      if (a.y < -20) a.y = h + 20
      if (a.y > h + 20) a.y = -20

      // Pulse
      a.pulse += a.pulseSpeed
    }
  }

  function spawnPackets() {
    // Occasionally send data packets between nearby agents
    if (Math.random() > 0.03) return

    const sender = agents[Math.floor(Math.random() * agents.length)]
    let closest: Agent | null = null
    let closestDist = Infinity

    for (const other of agents) {
      if (other === sender) continue
      const dx = sender.x - other.x
      const dy = sender.y - other.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180 && dist < closestDist) {
        closestDist = dist
        closest = other
      }
    }

    if (closest) {
      packets.push({
        from: sender,
        to: closest,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
      })
    }
  }

  function spawnWhisper() {
    // Very rare: roughly every 10–20s a faint "Psalm 23:1" appears
    if (whispers.length > 0) return
    if (Math.random() > 0.0015) return
    whispers.push({
      x: 60 + Math.random() * Math.max(1, w - 120),
      y: 40 + Math.random() * Math.max(1, h - 80),
      age: 0,
      life: 320 + Math.random() * 180,
      peakOpacity: 0.1 + Math.random() * 0.06,
    })
  }

  function updateWhispers() {
    for (let i = whispers.length - 1; i >= 0; i--) {
      whispers[i].age++
      if (whispers[i].age >= whispers[i].life) whispers.splice(i, 1)
    }
  }

  function drawWhispers() {
    for (const wp of whispers) {
      const t = wp.age / wp.life
      // smooth fade in/out
      const alpha = Math.sin(t * Math.PI) * wp.peakOpacity
      ctx.font = '8px "Inter", system-ui, sans-serif'
      ctx.fillStyle = `rgba(199, 210, 254, ${alpha})`
      ctx.fillText('Psalm 23:1', wp.x, wp.y)
    }
  }

  function updatePackets() {
    for (let i = packets.length - 1; i >= 0; i--) {
      packets[i].progress += packets[i].speed
      if (packets[i].progress >= 1) {
        packets.splice(i, 1)
      }
    }
  }

  function drawConnections() {
    const connectionRange = 150

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a = agents[i]
        const b = agents[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < connectionRange) {
          const fade = 1 - dist / connectionRange
          // Stronger lines between higher-tier agents
          const tierBoost =
            a.tier === 'primary' && b.tier === 'primary' ? 1.8 :
            a.tier !== 'minor' && b.tier !== 'minor' ? 1.2 : 0.6

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * fade * tierBoost})`
          ctx.lineWidth = a.tier === 'primary' && b.tier === 'primary' ? 0.8 : 0.4
          ctx.stroke()
        }
      }
    }
  }

  function drawPackets() {
    for (const p of packets) {
      const x = p.from.x + (p.to.x - p.from.x) * p.progress
      const y = p.from.y + (p.to.y - p.from.y) * p.progress
      // Small bright dot traveling along the connection
      const alpha = Math.sin(p.progress * Math.PI) * 0.5
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`
      ctx.fill()
    }
  }

  function drawAgents() {
    for (const a of agents) {
      const pulseAlpha = Math.sin(a.pulse) * 0.08
      const opacity = a.baseOpacity + pulseAlpha

      // Outer glow for primary agents
      if (a.tier === 'primary') {
        const glow = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius * 4)
        glow.addColorStop(0, `rgba(99, 102, 241, ${opacity * 0.25})`)
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)')
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }

      // Core dot
      ctx.beginPath()
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`
      ctx.fill()

      // Bright inner core for primary/secondary
      if (a.tier !== 'minor') {
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.radius * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(199, 210, 254, ${opacity * 0.6})`
        ctx.fill()
      }
    }
  }

  function draw() {
    time++
    ctx.clearRect(0, 0, w, h)

    moveAgents()
    spawnPackets()
    updatePackets()
    spawnWhisper()
    updateWhispers()

    drawConnections()
    drawPackets()
    drawAgents()
    drawWhispers()

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
