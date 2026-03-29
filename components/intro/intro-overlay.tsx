'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SESSION_KEY = 'matrix-intro-played'

function checkShouldPlay(): boolean {
  if (typeof window === 'undefined') return false
  return !sessionStorage.getItem(SESSION_KEY)
}

function markPlayed() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, '1')
  }
}

// --- Particle canvas using 2D Canvas API for crisp rendering ---

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
      const currentRadius = pt.radius * (1 - p * 0.92)
      const swirlX = Math.cos(swirlAngle) * currentRadius
      const swirlY = Math.sin(swirlAngle) * currentRadius * 0.7

      const blendP = Math.min(1, p * 2)
      const x = cx + pt.ox * (1 - blendP) + swirlX * blendP
      const y = cy + pt.oy * (1 - blendP) + swirlY * blendP

      const alpha = p < 0.55 ? 0.6 + Math.sin(time * pt.speed * 2) * 0.15 : Math.max(0, 0.75 - (p - 0.55) * 2.2)
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

// --- Main intro overlay ---

export function IntroOverlay() {
  const [shouldPlay, setShouldPlay] = useState(false)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const reducedMotion = useReducedMotion()
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const play = checkShouldPlay()
    setShouldPlay(play)
    if (!play) setVisible(false)
  }, [])

  const handleComplete = useCallback(() => {
    markPlayed()
    setVisible(false)
  }, [])

  // Reduced motion: quick fade
  useEffect(() => {
    if (shouldPlay && reducedMotion) {
      const t = setTimeout(() => { markPlayed(); setVisible(false) }, 600)
      return () => clearTimeout(t)
    }
  }, [shouldPlay, reducedMotion])

  // Main animation driver
  useEffect(() => {
    if (!shouldPlay || reducedMotion || !visible) return

    const isMobile = window.innerWidth < 768
    const totalMs = isMobile ? 2800 : 3500
    const holdMs = 900
    startRef.current = performance.now()

    const tick = () => {
      const elapsed = performance.now() - startRef.current
      const raw = Math.min(1, elapsed / totalMs)
      // Ease: slow start, fast middle, decelerate end
      const eased = raw < 0.2
        ? raw * raw * 25 * 0.04
        : raw < 0.7
          ? 0.04 + (raw - 0.2) * 1.92
          : 1 - (1 - raw) * (1 - raw) * (1 / 0.09)
      setProgress(Math.min(1, Math.max(0, eased)))

      if (elapsed < totalMs + holdMs) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        handleComplete()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [shouldPlay, reducedMotion, visible, handleComplete])

  // Safety timeout
  useEffect(() => {
    if (shouldPlay && visible) {
      const t = setTimeout(() => { markPlayed(); setVisible(false) }, 7000)
      return () => clearTimeout(t)
    }
  }, [shouldPlay, visible])

  if (!shouldPlay) return null

  const logoOpacity = Math.max(0, Math.min(1, (progress - 0.4) / 0.3))
  const logoScale = 0.85 + logoOpacity * 0.15
  const glowOpacity = Math.max(0, Math.min(0.7, (progress - 0.35) / 0.4))
  const textOpacity = Math.max(0, Math.min(1, (progress - 0.6) / 0.25))

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
          {/* Particle swirl — 2D Canvas, high-DPR */}
          {!reducedMotion && <ParticleCanvas progress={progress} />}

          {/* Ambient radial glow */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: 600, height: 600,
              transform: `translate(-50%, -50%) scale(${0.5 + glowOpacity * 0.8})`,
              background: 'radial-gradient(circle, rgba(109,40,217,0.45) 0%, rgba(79,70,229,0.15) 35%, transparent 65%)',
              opacity: glowOpacity,
            }}
          />

          {/* Crisp logo — rendered natively by the browser, not WebGL */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -55%) scale(${logoScale})`,
              opacity: logoOpacity,
            }}
          >
            <Image
              src="/musclelock/assets/matrix_logo_lock.png"
              alt=""
              width={1024}
              height={682}
              className="w-[220px] sm:w-[300px] md:w-[360px] h-auto"
              style={{ filter: `drop-shadow(0 0 30px rgba(109,40,217,0.6)) drop-shadow(0 0 60px rgba(79,70,229,0.3))` }}
              priority
              unoptimized
            />
          </div>

          {/* Brand text */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: 'translate(-50%, 75px)',
              opacity: textOpacity,
            }}
          >
            <p className="text-center text-lg sm:text-xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-accent-blue via-accent-purple to-accent-purple-light">
              MATRIX
            </p>
            <p className="text-center text-[10px] sm:text-xs tracking-[0.3em] text-steel-500 mt-1">
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
