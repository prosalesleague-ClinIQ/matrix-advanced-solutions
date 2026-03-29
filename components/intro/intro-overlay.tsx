'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Dynamic import so Three.js doesn't load until the intro actually mounts
const IntroScene = dynamic(
  () => import('./intro-scene').then((mod) => ({ default: mod.IntroScene })),
  { ssr: false }
)

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

function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function IntroOverlay() {
  const [shouldPlay, setShouldPlay] = useState(false)
  const [visible, setVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [webglOk, setWebglOk] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const play = checkShouldPlay()
    setShouldPlay(play)
    setIsMobile(checkIsMobile())
    setWebglOk(checkWebGLSupport())

    if (!play) {
      setVisible(false)
    }
  }, [])

  const handleComplete = useCallback(() => {
    markPlayed()
    setVisible(false)
  }, [])

  // Reduced motion: skip to short elegant fade
  useEffect(() => {
    if (shouldPlay && reducedMotion) {
      const timer = setTimeout(() => {
        markPlayed()
        setVisible(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [shouldPlay, reducedMotion])

  // WebGL failure: show CSS fallback briefly
  useEffect(() => {
    if (shouldPlay && !webglOk) {
      const timer = setTimeout(() => {
        markPlayed()
        setVisible(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [shouldPlay, webglOk])

  // Safety timeout — never trap the user
  useEffect(() => {
    if (shouldPlay && visible) {
      const timer = setTimeout(() => {
        markPlayed()
        setVisible(false)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [shouldPlay, visible])

  if (!shouldPlay) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999]"
          style={{ background: '#050510' }}
          aria-hidden="true"
        >
          {/* WebGL scene or fallback */}
          {webglOk && !reducedMotion ? (
            <IntroScene onComplete={handleComplete} isMobile={isMobile} />
          ) : (
            // CSS fallback: simple logo glow
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">M</span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-accent-purple/30 blur-2xl -z-10" />
              </motion.div>
            </div>
          )}

          {/* Skip button */}
          <button
            onClick={handleComplete}
            className="absolute bottom-8 right-8 text-xs text-white/30 hover:text-white/60 transition-colors z-10"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
