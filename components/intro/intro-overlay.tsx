'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SESSION_KEY = 'matrix-intro-played'

// Check synchronously on first render to avoid flash
function getInitialState() {
  if (typeof window === 'undefined') return { shouldPlay: false, alreadyPlayed: true }
  const played = sessionStorage.getItem(SESSION_KEY)
  return { shouldPlay: !played, alreadyPlayed: !!played }
}

function markPlayed() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, '1')
  }
}

// --- 2D Canvas particle swirl ---

function ParticleCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<{
    ox: number; oy: number
    speed: number; phase: number; radius: number; size: number
    hue: number; brightness: number
  }[]>([])
  const initRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || initRef.current) return
    initRef.current = true

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    const count = window.innerWidth < 768 ? 250 : 600
    const particles: typeof particlesRef.current = []
    for (let i = 0; i < count; i++) {
      particles.push({
        ox: (Math.random() - 0.5) * canvas.width * 1.3,
        oy: (Math.random() - 0.5) * canvas.height * 1.3,
        speed: 0.3 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        radius: (0.3 + Math.random() * 0.7) * Math.max(canvas.width, canvas.height) * 0.45,
        size: 0.5 + Math.random() * 1.5,
        hue: 220 + Math.random() * 80,
        brightness: 40 + Math.random() * 40,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const p = progress
    const time = performance.now() / 1000

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const pt of particlesRef.current) {
      const swirlAngle = time * pt.speed + pt.phase + p * 5
      const currentRadius = pt.radius * Math.max(0.02, 1 - p * 0.95)
      const swirlX = Math.cos(swirlAngle) * currentRadius
      const swirlY = Math.sin(swirlAngle) * currentRadius * 0.7

      const blendP = Math.min(1, p * 2)
      const x = cx + pt.ox * (1 - blendP) + swirlX * blendP
      const y = cy + pt.oy * (1 - blendP) + swirlY * blendP

      const alpha = p < 0.5 ? 0.55 + Math.sin(time * pt.speed * 2) * 0.12 : Math.max(0, 0.67 - (p - 0.5) * 1.8)
      if (alpha <= 0) continue

      const size = pt.size * (1 + (1 - p) * 0.5)
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${pt.hue}, 60%, ${pt.brightness}%, ${alpha})`
      ctx.fill()
    }
  }, [progress])

  return <canvas ref={canvasRef} className="absolute inset-0" style={{ display: 'block' }} />
}

// --- Main overlay ---

export function IntroOverlay() {
  const initial = useRef(getInitialState())
  const [visible, setVisible] = useState(initial.current.shouldPlay)
  const [progress, setProgress] = useState(0)
  const reducedMotion = useReducedMotion()
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  // Don't render anything if already played
  if (initial.current.alreadyPlayed) return null

  const handleComplete = useCallback(() => {
    markPlayed()
    setVisible(false)
  }, [])

  // Reduced motion: quick fade
  useEffect(() => {
    if (visible && reducedMotion) {
      const t = setTimeout(() => { markPlayed(); setVisible(false) }, 600)
      return () => clearTimeout(t)
    }
  }, [visible, reducedMotion])

  // Main animation driver
  useEffect(() => {
    if (!visible || reducedMotion) return

    const isMobile = window.innerWidth < 768
    const totalMs = isMobile ? 2800 : 3500
    const holdMs = 1000
    startRef.current = performance.now()

    const tick = () => {
      const elapsed = performance.now() - startRef.current
      const raw = Math.min(1, elapsed / totalMs)
      // Smooth ease-in-out
      const eased = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2
      setProgress(eased)

      if (elapsed < totalMs + holdMs) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        handleComplete()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, reducedMotion, handleComplete])

  // Safety timeout
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => { markPlayed(); setVisible(false) }, 7000)
      return () => clearTimeout(t)
    }
  }, [visible])

  const logoOpacity = Math.max(0, Math.min(1, (progress - 0.35) / 0.3))
  const logoScale = 0.88 + logoOpacity * 0.12
  const glowOpacity = Math.max(0, Math.min(0.7, (progress - 0.3) / 0.4))
  const textOpacity = Math.max(0, Math.min(1, (progress - 0.65) / 0.2))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#040410]"
          aria-hidden="true"
        >
          {/* Particle swirl */}
          {!reducedMotion && <ParticleCanvas progress={progress} />}

          {/* Ambient radial glow */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: 800, height: 800,
              transform: `translate(-50%, -50%) scale(${0.4 + glowOpacity * 0.9})`,
              background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(79,70,229,0.15) 30%, transparent 60%)',
              opacity: glowOpacity,
            }}
          />

          {/* Logo — large, crisp, native img */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -55%) scale(${logoScale})`,
              opacity: logoOpacity,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/musclelock/assets/matrix_logo_lock.png"
              alt=""
              width={1024}
              height={682}
              className="w-[320px] sm:w-[420px] md:w-[520px] lg:w-[580px] h-auto"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(109,40,217,0.6)) drop-shadow(0 0 80px rgba(79,70,229,0.3))',
                imageRendering: 'auto',
              }}
            />
          </div>

          {/* Brand text below logo */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: 'translate(-50%, 110px)',
              opacity: textOpacity,
            }}
          >
            <p className="text-center text-xl sm:text-2xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-accent-blue via-accent-purple to-accent-purple-light">
              MATRIX
            </p>
            <p className="text-center text-[10px] sm:text-xs tracking-[0.3em] text-steel-500 mt-1.5">
              ADVANCED SOLUTIONS
            </p>
          </div>

          {/* Skip */}
          <button
            onClick={handleComplete}
            className="absolute bottom-6 right-6 text-[11px] text-white/20 hover:text-white/50 transition-colors z-10"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
