/**
 * Target positions for the DNA lock logo formation.
 * Generates point clouds for each structural zone.
 */

type Vec3 = [number, number, number]

// Lock body — rounded rectangle shape
function generateLockBody(count: number): Vec3[] {
  const points: Vec3[] = []
  const w = 0.8, h = 1.2
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    // Rounded rectangle perimeter
    const angle = t
    let x: number, y: number
    if (angle < Math.PI * 0.5) {
      x = w * Math.cos(angle)
      y = -h * 0.3 + h * 0.5 * Math.sin(angle)
    } else if (angle < Math.PI) {
      x = -w + w * 2 * (1 - (angle - Math.PI * 0.5) / (Math.PI * 0.5))
      y = h * 0.2
    } else if (angle < Math.PI * 1.5) {
      x = -w * Math.cos(angle - Math.PI)
      y = -h * 0.3 - h * 0.5 * Math.sin(angle - Math.PI)
    } else {
      x = -w + w * 2 * ((angle - Math.PI * 1.5) / (Math.PI * 0.5))
      y = -h * 0.8
    }
    const z = (Math.random() - 0.5) * 0.15
    points.push([x, y - 0.2, z])
  }
  return points
}

// Shackle — the arc on top of the lock
function generateShackle(count: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI
    const x = Math.cos(t) * 0.55
    const y = Math.sin(t) * 0.6 + 0.2
    const z = (Math.random() - 0.5) * 0.1
    points.push([x, y, z])
  }
  return points
}

// Keyhole — small diamond/circle in center
function generateKeyhole(count: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const r = 0.12 + Math.random() * 0.05
    const x = Math.cos(t) * r
    const y = Math.sin(t) * r - 0.35
    // Keyhole slit below circle
    const isSlit = i > count * 0.6
    const finalY = isSlit ? y - 0.1 - Math.random() * 0.15 : y
    const finalX = isSlit ? x * 0.3 : x
    points.push([finalX, finalY, (Math.random() - 0.5) * 0.05])
  }
  return points
}

// DNA helix — upper sweep (wrapping around lock)
function generateHelixUpper(count: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2.5 + Math.PI * 0.5
    const radius = 0.9 + Math.sin(t * 0.8) * 0.15
    const x = Math.cos(t) * radius
    const y = (i / count) * 1.8 - 0.5
    const z = Math.sin(t) * 0.4
    points.push([x, y, z])
  }
  return points
}

// DNA helix — lower sweep
function generateHelixLower(count: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2.5 + Math.PI * 1.5
    const radius = 0.9 + Math.cos(t * 0.8) * 0.15
    const x = Math.cos(t) * radius
    const y = (i / count) * 1.8 - 0.5
    const z = Math.sin(t) * 0.4
    points.push([x, y, z])
  }
  return points
}

// Orbital rings — atom-like orbits
function generateOrbitalRing(count: number, tilt: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const x = Math.cos(t) * 1.3
    const y = Math.sin(t) * 0.4 * Math.cos(tilt) + Math.sin(t) * Math.sin(tilt) * 1.1
    const z = Math.sin(t) * 0.3
    points.push([x, y, z])
  }
  return points
}

// Halo glow particles around the whole shape
function generateHalo(count: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 1.2 + Math.random() * 0.6
    const x = Math.cos(angle) * radius
    const y = (Math.random() - 0.5) * 2.2
    const z = (Math.random() - 0.5) * 0.8
    points.push([x, y, z])
  }
  return points
}

export type LogoZone = 'lockBody' | 'shackle' | 'keyhole' | 'helixUpper' | 'helixLower' | 'orbital1' | 'orbital2' | 'halo'

export interface LogoTargets {
  positions: Float32Array
  colors: Float32Array
  zones: LogoZone[]
  count: number
}

export function generateLogoTargets(particleCount: number): LogoTargets {
  // Distribute particles across zones
  const distribution = {
    lockBody: Math.floor(particleCount * 0.15),
    shackle: Math.floor(particleCount * 0.1),
    keyhole: Math.floor(particleCount * 0.06),
    helixUpper: Math.floor(particleCount * 0.14),
    helixLower: Math.floor(particleCount * 0.14),
    orbital1: Math.floor(particleCount * 0.1),
    orbital2: Math.floor(particleCount * 0.1),
    halo: 0 as number,
  }
  distribution.halo = particleCount - Object.values(distribution).reduce((a, b) => a + b, 0)

  const allPoints: Vec3[] = []
  const allZones: LogoZone[] = []

  const addZone = (zone: LogoZone, pts: Vec3[]) => {
    pts.forEach(p => { allPoints.push(p); allZones.push(zone) })
  }

  addZone('lockBody', generateLockBody(distribution.lockBody))
  addZone('shackle', generateShackle(distribution.shackle))
  addZone('keyhole', generateKeyhole(distribution.keyhole))
  addZone('helixUpper', generateHelixUpper(distribution.helixUpper))
  addZone('helixLower', generateHelixLower(distribution.helixLower))
  addZone('orbital1', generateOrbitalRing(distribution.orbital1, 0.4))
  addZone('orbital2', generateOrbitalRing(distribution.orbital2, -0.6))
  addZone('halo', generateHalo(distribution.halo))

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  // Zone colors matching Matrix brand
  const zoneColors: Record<LogoZone, [number, number, number]> = {
    lockBody: [0.31, 0.27, 0.90],     // indigo-blue
    shackle: [0.31, 0.27, 0.90],      // indigo-blue
    keyhole: [0.85, 0.55, 0.15],      // warm amber
    helixUpper: [0.66, 0.33, 0.97],   // purple (accent-purple)
    helixLower: [0.13, 0.83, 0.93],   // cyan
    orbital1: [0.31, 0.27, 0.90],     // indigo
    orbital2: [0.66, 0.33, 0.97],     // purple
    halo: [0.4, 0.5, 0.95],          // soft blue
  }

  for (let i = 0; i < particleCount; i++) {
    const p = allPoints[i]
    positions[i * 3] = p[0]
    positions[i * 3 + 1] = p[1]
    positions[i * 3 + 2] = p[2]

    const c = zoneColors[allZones[i]]
    // Slight color variance
    const v = 0.9 + Math.random() * 0.2
    colors[i * 3] = c[0] * v
    colors[i * 3 + 1] = c[1] * v
    colors[i * 3 + 2] = c[2] * v
  }

  return { positions, colors, zones: allZones, count: particleCount }
}
