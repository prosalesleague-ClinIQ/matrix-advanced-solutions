'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// --- Swirling star particles ---

function SwirlParticles({ isMobile, progress }: { isMobile: boolean; progress: React.MutableRefObject<{ value: number }> }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = isMobile ? 400 : 900

  const { initialPositions, swirlParams } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const params: { speed: number; radius: number; phase: number; targetRadius: number }[] = []
    for (let i = 0; i < count; i++) {
      // Start scattered
      const angle = Math.random() * Math.PI * 2
      const dist = 3 + Math.random() * 8
      pos[i * 3] = Math.cos(angle) * dist
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
      params.push({
        speed: 0.3 + Math.random() * 1.8,
        radius: 2 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        targetRadius: 0.3 + Math.random() * 1.2,
      })
    }
    return { initialPositions: pos, swirlParams: params }
  }, [count])

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(initialPositions), 3))
    return geom
  }, [initialPositions])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array
    const p = progress.current.value
    const t = clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const sp = swirlParams[i]

      // Current orbital radius shrinks as progress increases
      const currentRadius = sp.radius * (1 - p * 0.85) + sp.targetRadius * p * 0.15
      const swirlAngle = t * sp.speed + sp.phase + p * 6

      // Spiral inward
      const sx = initialPositions[i3]
      const sy = initialPositions[i3 + 1]
      const sz = initialPositions[i3 + 2]

      const targetX = Math.cos(swirlAngle) * currentRadius * (1 - p * 0.7)
      const targetY = Math.sin(swirlAngle) * currentRadius * 0.6 * (1 - p * 0.7)
      const targetZ = -1 + Math.sin(swirlAngle * 0.5) * 0.5 * (1 - p)

      pos[i3] = sx * (1 - p) + targetX * p
      pos[i3 + 1] = sy * (1 - p) + targetY * p
      pos[i3 + 2] = sz * (1 - p) + targetZ * p
    }
    posAttr.needsUpdate = true

    // Fade particles as logo appears
    const mat = pointsRef.current.material as THREE.PointsMaterial
    mat.opacity = p < 0.7 ? 0.7 : 0.7 * (1 - (p - 0.7) / 0.3)
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={isMobile ? 2 : 2.5}
        color="#8b9cc7"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// --- Background star field (static) ---

function BackgroundStars({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25
      pos[i * 3 + 2] = -8 - Math.random() * 20
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return geom
  }, [count])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={1.2} color="#556688" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// --- Glowing halo ring around the logo ---

function LogoHalo({ progress }: { progress: React.MutableRefObject<{ value: number }> }) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!ringRef.current) return
    const p = progress.current.value
    // Halo appears after 60% progress
    const haloP = Math.max(0, (p - 0.6) / 0.4)
    ringRef.current.scale.setScalar(1.8 + (1 - haloP) * 2)
    const mat = ringRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = haloP * 0.25
  })

  return (
    <mesh ref={ringRef} position={[0, 0, -0.5]}>
      <ringGeometry args={[1.2, 1.8, 64]} />
      <meshBasicMaterial color="#6d28d9" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

// --- Logo image plane that fades in crisp ---

function LogoImage({ progress }: { progress: React.MutableRefObject<{ value: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(THREE.TextureLoader, '/musclelock/assets/matrix_logo_lock.png')

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
    }
  }, [texture])

  useFrame(() => {
    if (!meshRef.current) return
    const p = progress.current.value
    // Logo image starts appearing at 55% and is fully visible at 85%
    const logoP = Math.max(0, Math.min(1, (p - 0.55) / 0.3))
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = logoP
    // Subtle scale-in
    const scale = 0.85 + logoP * 0.15
    meshRef.current.scale.set(scale * 2.2, scale * 2.8, 1)
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// --- Ambient glow behind logo ---

function AmbientGlow({ progress }: { progress: React.MutableRefObject<{ value: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const p = progress.current.value
    const glowP = Math.max(0, (p - 0.5) / 0.5)
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = glowP * 0.15
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial color="#4f46e5" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

// --- Camera ---

function CameraDrift() {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.12) * 0.15
    camera.position.y = Math.cos(t * 0.08) * 0.1
    camera.lookAt(0, 0, 0)
  })
  return null
}

// --- Main scene ---

interface IntroSceneProps {
  onComplete: () => void
  isMobile: boolean
}

export function IntroScene({ onComplete, isMobile }: IntroSceneProps) {
  const progressRef = useRef({ value: 0 })

  useEffect(() => {
    const duration = isMobile ? 2.5 : 3.2

    const tl = gsap.timeline()
    // Phase 1: subtle drift (0 → 0.1)
    tl.to(progressRef.current, { value: 0.1, duration: duration * 0.15, ease: 'power1.inOut' })
    // Phase 2: swirl acceleration (0.1 → 0.55)
    .to(progressRef.current, { value: 0.55, duration: duration * 0.3, ease: 'power2.in' })
    // Phase 3: convergence + logo reveal (0.55 → 0.9)
    .to(progressRef.current, { value: 0.9, duration: duration * 0.35, ease: 'power2.out' })
    // Phase 4: settle + hold (0.9 → 1.0)
    .to(progressRef.current, {
      value: 1.0,
      duration: duration * 0.2,
      ease: 'power1.out',
      onComplete: () => { setTimeout(onComplete, 900) },
    })

    return () => { tl.kill() }
  }, [onComplete, isMobile])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, isMobile ? 1 : 1.5]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: '#040410' }}
    >
      <color attach="background" args={['#040410']} />
      <BackgroundStars count={isMobile ? 200 : 500} />
      <SwirlParticles isMobile={isMobile} progress={progressRef} />
      <AmbientGlow progress={progressRef} />
      <LogoHalo progress={progressRef} />
      <LogoImage progress={progressRef} />
      <CameraDrift />
    </Canvas>
  )
}
