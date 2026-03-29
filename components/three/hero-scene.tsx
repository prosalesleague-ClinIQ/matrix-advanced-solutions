'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null)
  const reducedMotion = useReducedMotion()

  const nodes = useMemo(() => {
    const points: { position: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 30; i++) {
      points.push({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2,
        ],
        scale: Math.random() * 0.04 + 0.02,
      })
    }
    return points
  }, [])

  const connections = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        )
        if (dist < 3.5) {
          lines.push({ start: nodes[i].position, end: nodes[j].position })
        }
      }
    }
    return lines
  }, [nodes])

  useFrame(({ clock }) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.1
      groupRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.03) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.position}>
          <sphereGeometry args={[node.scale, 6, 6]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
      ))}
      {connections.map((conn, i) => (
        <Line
          key={`line-${i}`}
          points={[conn.start, conn.end]}
          color="#a855f7"
          transparent
          opacity={0.08}
          lineWidth={1}
        />
      ))}
    </group>
  )
}

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null)
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }) => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.5) * 0.05)
    }
  })

  return (
    <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={[2, 0, -1]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color="#6d28d9" transparent opacity={0.12} wireframe />
      </mesh>
    </Float>
  )
}

export function HeroScene() {
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)

  // Defer 3D initialization until after main thread is idle
  useEffect(() => {
    if (reducedMotion) return
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => cancelIdleCallback(id)
    } else {
      const id = setTimeout(() => setReady(true), 100)
      return () => clearTimeout(id)
    }
  }, [reducedMotion])

  if (reducedMotion || !ready) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-purple-light/3 blur-2xl" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-transparent to-navy-950 z-10 pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        frameloop="always"
      >
        <ambientLight intensity={0.3} />
        <NetworkNodes />
        <CentralOrb />
      </Canvas>
    </div>
  )
}
