import { useEffect, useMemo, useRef, useState } from 'react'
import { ANIMATIONS, CHARACTER_LAYOUT, GAME_SIZE } from '../lib/animationConfig'
import useSpriteAssets from '../hooks/useSpriteAssets'

const MAX_HP = 100

function createBurst() {
  return Array.from({ length: 14 }).map(() => ({
    x: (Math.random() - 0.5) * 120,
    y: -10 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 5,
    vy: -2 - Math.random() * 2,
    radius: 5 + Math.random() * 15,
    life: 24 + Math.random() * 16,
    age: 0,
  }))
}

export default function GameCanvas() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const prevTimeRef = useRef(0)
  const stateRef = useRef('idle')
  const frameRef = useRef(0)
  const frameAccRef = useRef(0)
  const shakeRef = useRef(0)
  const flashRef = useRef(0)
  const particlesRef = useRef([])
  const floatingDamageRef = useRef([])

  const [gameState, setGameState] = useState('idle')
  const [hp, setHp] = useState(MAX_HP)
  const [combo, setCombo] = useState(0)

  const { images, ready } = useSpriteAssets(ANIMATIONS)

  const spriteMeta = useMemo(() => ANIMATIONS[gameState], [gameState])

  const changeState = (next) => {
    stateRef.current = next
    frameRef.current = 0
    frameAccRef.current = 0
    setGameState(next)
  }

  const triggerHit = () => {
    const damage = 7 + Math.floor(Math.random() * 9)
    changeState('hit')
    shakeRef.current = 16
    flashRef.current = 0.85
    particlesRef.current = createBurst()
    floatingDamageRef.current.push({ value: damage, x: 0, y: -30, age: 0, life: 42 })
    setHp((prev) => Math.max(0, prev - damage))
    setCombo((prev) => prev + 1)
  }

  const resetGame = () => {
    changeState('idle')
    setHp(MAX_HP)
    setCombo(0)
    particlesRef.current = []
    floatingDamageRef.current = []
    shakeRef.current = 0
    flashRef.current = 0
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        triggerHit()
      }
      if (event.key.toLowerCase() === 'r') {
        resetGame()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const drawBackground = (ctx, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, GAME_SIZE.height)
      g.addColorStop(0, '#171827')
      g.addColorStop(1, '#080911')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height)

      const glow = 18 + Math.sin(t / 600) * 8
      ctx.strokeStyle = 'rgba(111, 185, 255, 0.55)'
      ctx.lineWidth = 2
      for (let x = 70; x < GAME_SIZE.width; x += 82) {
        ctx.beginPath()
        ctx.moveTo(x, 120)
        ctx.lineTo(x, GAME_SIZE.height - 70)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(253, 112, 246, 0.45)'
      for (let y = 120; y < GAME_SIZE.height - 30; y += 60) {
        ctx.beginPath()
        ctx.moveTo(40, y)
        ctx.lineTo(GAME_SIZE.width - 40, y)
        ctx.stroke()
      }

      ctx.strokeStyle = `rgba(78, 186, 255, ${0.18 + glow / 100})`
      ctx.lineWidth = 12
      ctx.strokeRect(34, 74, GAME_SIZE.width - 68, GAME_SIZE.height - 110)
    }

    const drawUi = () => {
      const barX = 144
      const barY = 34
      const barW = 670
      const barH = 28
      ctx.fillStyle = '#0f1220'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.strokeRect(barX, barY, barW, barH)

      const currentW = (hp / MAX_HP) * (barW - 4)
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
      grad.addColorStop(0, '#ffb100')
      grad.addColorStop(1, '#ff6336')
      ctx.fillStyle = grad
      ctx.fillRect(barX + 2, barY + 2, currentW, barH - 4)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 26px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('BOSS HP', GAME_SIZE.width / 2, 28)

      ctx.textAlign = 'left'
      ctx.font = 'bold 24px Arial'
      ctx.fillText(`Combo ${combo}`, 52, 52)
    }

    const drawCharacter = (delta, t) => {
      const anim = ANIMATIONS[stateRef.current]
      const img = images[stateRef.current]
      if (!img) return

      const frameDuration = 1000 / anim.fps
      frameAccRef.current += delta
      while (frameAccRef.current >= frameDuration) {
        frameAccRef.current -= frameDuration
        frameRef.current += 1
        if (frameRef.current >= anim.frames) {
          if (anim.loop) {
            frameRef.current = 0
          } else {
            const next = anim.next ?? 'idle'
            changeState(next)
            return
          }
        }
      }

      const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0
      const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 0.4 : 0
      if (shakeRef.current > 0) shakeRef.current *= 0.88
      if (flashRef.current > 0) flashRef.current *= 0.88

      const bob = stateRef.current === 'idle' ? Math.sin(t / 220) * 7 : Math.sin(t / 120) * 3
      const { x, y, width, height, shadowWidth, shadowHeight } = CHARACTER_LAYOUT

      ctx.save()
      ctx.translate(shakeX, shakeY)

      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.beginPath()
      ctx.ellipse(x, y + 118, shadowWidth, shadowHeight, 0, 0, Math.PI * 2)
      ctx.fill()

      const sx = frameRef.current * anim.frameWidth
      ctx.drawImage(
        img,
        sx,
        0,
        anim.frameWidth,
        anim.frameHeight,
        x - width / 2,
        y - height / 2 + bob,
        width,
        height
      )

      if (flashRef.current > 0.05) {
        ctx.fillStyle = `rgba(255,255,255,${flashRef.current * 0.35})`
        ctx.beginPath()
        ctx.arc(x, y + bob, 122, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    const drawParticles = () => {
      const cx = CHARACTER_LAYOUT.x
      const cy = CHARACTER_LAYOUT.y
      particlesRef.current = particlesRef.current.filter((p) => p.age < p.life)
      particlesRef.current.forEach((p) => {
        p.age += 1
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06
        const alpha = 1 - p.age / p.life
        ctx.fillStyle = `rgba(117, 211, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(cx + p.x, cy + p.y, p.radius * alpha, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawFloatingDamage = () => {
      floatingDamageRef.current = floatingDamageRef.current.filter((f) => f.age < f.life)
      floatingDamageRef.current.forEach((f) => {
        f.age += 1
        f.y -= 1.4
        const alpha = 1 - f.age / f.life
        ctx.font = 'bold 42px Arial'
        ctx.textAlign = 'center'
        ctx.lineWidth = 6
        ctx.strokeStyle = `rgba(20, 24, 37, ${alpha})`
        ctx.strokeText(`-${f.value}`, CHARACTER_LAYOUT.x + f.x, CHARACTER_LAYOUT.y + f.y)
        ctx.fillStyle = `rgba(255, 245, 156, ${alpha})`
        ctx.fillText(`-${f.value}`, CHARACTER_LAYOUT.x + f.x, CHARACTER_LAYOUT.y + f.y)
      })
    }

    const render = (time) => {
      const delta = prevTimeRef.current ? time - prevTimeRef.current : 16.7
      prevTimeRef.current = time
      ctx.clearRect(0, 0, GAME_SIZE.width, GAME_SIZE.height)
      drawBackground(ctx, time)
      drawUi()
      drawParticles()
      drawCharacter(delta, time)
      drawFloatingDamage()
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hp, combo, images, ready])

  return (
    <div className="game-panel">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={GAME_SIZE.width}
        height={GAME_SIZE.height}
      />

      <div className="hud-row">
        <div className="stat-card">
          <span className="label">State</span>
          <strong>{gameState}</strong>
        </div>
        <div className="stat-card">
          <span className="label">HP</span>
          <strong>{hp}</strong>
        </div>
        <div className="stat-card">
          <span className="label">Frames</span>
          <strong>{spriteMeta.frames}</strong>
        </div>
      </div>

      <div className="button-row">
        <button onClick={triggerHit}>피격 트리거</button>
        <button className="secondary" onClick={resetGame}>리셋</button>
      </div>
    </div>
  )
}
