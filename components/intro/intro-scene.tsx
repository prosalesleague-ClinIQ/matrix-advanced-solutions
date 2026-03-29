'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { generateLogoTargets } from './logo-target'

// --- Particle system ---

interface ParticleFieldProps {
  onFormationComplete: () => void
  isMobile: boolean
}

function ParticleField({ onFormationComplete, isMobile }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const progressRef = useRef({ value: 0 })
  const completedRef = useRef(false)

  const count = isMobile ? 600 : 1400
  const logoTargets = useMemo(() => generateLogoTargets(count), [count])

  // Initial scattered positions (star field)
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return arr
  }, [count])

  // Initial white-ish star colors
  const initialColors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const brightness = 0.5 + Math.random() * 0.5
      arr[i * 3] = brightness * 0.7
      arr[i * 3 + 1] = brightness * 0.8
      arr[i * 3 + 2] = brightness
    }
    return arr
  }, [count])

  // Sizes per particle
  const sizes = useMemo(() => {
    const arr = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      arr[i] = isMobile ? 1.5 + Math.random() * 2 : 1.5 + Math.random() * 2.5
    }
    return arr
  }, [count, isMobile])

  // Per-particle swirl parameters
  const swirlParams = useMemo(() => {
    const params: { swirlSpeed: number; swirlRadius: number; swirlPhase: number }[] = []
    for (let i = 0; i < count; i++) {
      params.push({
        swirlSpeed: 0.5 + Math.random() * 2,
        swirlRadius: 0.3 + Math.random() * 1.5,
        swirlPhase: Math.random() * Math.PI * 2,
      })
    }
    return params
  }, [count])

  // GSAP timeline
  useEffect(() => {
    const duration = isMobile ? 2.8 : 3.5

    const tl = gsap.timeline()
    // Phase 1: drift (0 to 0.15)
    tl.to(progressRef.current, {
      value: 0.15,
      duration: duration * 0.2,
      ease: 'power1.inOut',
    })
    // Phase 2: swirl acceleration (0.15 to 0.6)
    .to(progressRef.current, {
      value: 0.6,
      duration: duration * 0.35,
      ease: 'power2.in',
    })
    // Phase 3: convergence (0.6 to 0.95)
    .to(progressRef.current, {
      value: 0.95,
      duration: duration * 0.3,
      ease: 'power3.out',
    })
    // Phase 4: settle (0.95 to 1.0)
    .to(progressRef.current, {
      value: 1.0,
      duration: duration * 0.15,
      ease: 'power1.out',
      onComplete: () => {
        if (!completedRef.current) {
          completedRef.current = true
          // Hold briefly then signal completion
          setTimeout(onFormationComplete, 800)
        }
      },
    })

    return () => { tl.kill() }
  }, [onFormationComplete, isMobile])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const geom = pointsRef.current.geometry
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute
    const colAttr = geom.getAttribute('color') as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array
    const col = colAttr.array as Float32Array
    const p = progressRef.current.value
    const time = clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const sp = swirlParams[i]

      // Source
      const sx = initialPositions[i3]
      const sy = initialPositions[i3 + 1]
      const sz = initialPositions[i3 + 2]

      // Target
      const tx = logoTargets.positions[i3]
      const ty = logoTargets.positions[i3 + 1]
      const tz = logoTargets.positions[i3 + 2]

      // Swirl offset — strongest in mid-phase
      const swirlIntensity = Math.sin(p * Math.PI) * sp.swirlRadius * (1 - p * 0.7)
      const swirlAngle = time * sp.swirlSpeed + sp.swirlPhase + p * 4
      const swirlX = Math.cos(swirlAngle) * swirlIntensity
      const swirlY = Math.sin(swirlAngle) * swirlIntensity * 0.6

      // Interpolate position with swirl
      const easedP = p < 0.3 ? p * p * 3.3 : p
      pos[i3] = sx + (tx - sx) * easedP + swirlX
      pos[i3 + 1] = sy + (ty - sy) * easedP + swirlY
      pos[i3 + 2] = sz + (tz - sz) * easedP

      // Color transition: white stars → branded colors
      const colorP = Math.min(1, p * 1.5)
      col[i3] = initialColors[i3] + (logoTargets.colors[i3] - initialColors[i3]) * colorP
      col[i3 + 1] = initialColors[i3 + 1] + (logoTargets.colors[i3 + 1] - initialColors[i3 + 1]) * colorP
      col[i3 + 2] = initialColors[i3 + 2] + (logoTargets.colors[i3 + 2] - initialColors[i3 + 2]) * colorP
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(initialPositions), 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(initialColors), 3))
    return geom
  }, [initialPositions, initialColors])

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={isMobile ? 2.5 : 3}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// --- Background stars (static atmosphere) ---

function BackgroundStars({ count }: { count: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = -5 - Math.random() * 15
    }
    return arr
  }, [count])

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [positions])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={1} color="#667799" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// --- Camera subtle drift ---

function CameraDrift() {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.15) * 0.3
    camera.position.y = Math.cos(t * 0.1) * 0.15
    camera.lookAt(0, 0, 0)
  })

  return null
}

// --- Exported scene ---

interface IntroSceneProps {
  onComplete: () => void
  isMobile: boolean
}

export function IntroScene({ onComplete, isMobile }: IntroSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, isMobile ? 1 : 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'default' }}
      style={{ background: '#050510' }}
    >
      <color attach="background" args={['#050510']} />
      <BackgroundStars count={isMobile ? 150 : 400} />
      <ParticleField onFormationComplete={onComplete} isMobile={isMobile} />
      <CameraDrift />
    </Canvas>
  )
}
