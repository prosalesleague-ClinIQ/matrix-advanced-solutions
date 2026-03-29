/**
 * PathwayGraph — metabolic network data + signal propagation
 * Signal equation: A_{t+1} = A_t + Σ(w_i * s_i) - d * A_t
 */

export const NODE_CLASSES = {
  NUTRIENT:    { color: 0x00eaff, label: 'Nutrient Sensor' },
  GROWTH:      { color: 0x9b59ff, label: 'Growth Regulator' },
  ENERGY:      { color: 0xff9a00, label: 'Energy Regulator' },
  STRUCTURAL:  { color: 0x00ffaa, label: 'Structural System' },
}

// Spherical layout: rings at different elevations
const RING = {
  center:  { r: 0,   y: 0   },
  inner:   { r: 4,   y: 1   },
  mid:     { r: 7.5, y: -1  },
  outer:   { r: 11,  y: -3  },
}

function ringPos(ring, index, total) {
  const angle = (index / total) * Math.PI * 2
  return [
    ring.r * Math.cos(angle),
    ring.y + Math.sin(angle * 1.3) * 0.6,
    ring.r * Math.sin(angle),
  ]
}

export const NODES = {
  mTOR:         { pos: [0, 0, 0],                    class: 'GROWTH',     size: 0.65, label: 'mTOR Complex',          description: 'The master regulator of muscle protein synthesis. Leucine binding triggers a cascade that initiates muscle building.' },
  leucine:      { pos: ringPos(RING.inner, 0, 3),    class: 'NUTRIENT',   size: 0.38, label: 'Leucine Sensor',         description: 'Leucine binds to Sestrin2, relieving mTOR inhibition. Concentration follows Michaelis-Menten kinetics.' },
  akt:          { pos: ringPos(RING.inner, 1, 3),    class: 'GROWTH',     size: 0.35, label: 'AKT Pathway',            description: 'AKT (Protein Kinase B) amplifies mTOR signaling via the PI3K cascade — activated by Beta-Ecdysterone.' },
  ampk:         { pos: ringPos(RING.inner, 2, 3),    class: 'ENERGY',     size: 0.35, label: 'AMPK Regulator',         description: 'AMPK monitors the AMP/ATP ratio. When energy is sufficient, AMPK suppression allows mTOR to drive growth.' },
  ribosome:     { pos: ringPos(RING.mid, 0, 4),      class: 'STRUCTURAL', size: 0.42, label: 'Ribosome Cluster',       description: 'Ribosomes are the molecular machines that assemble amino acids into structural muscle proteins.' },
  mitochondria: { pos: ringPos(RING.mid, 1, 4),      class: 'ENERGY',     size: 0.42, label: 'Mitochondria',           description: 'Mitochondria convert nutrients into ATP. Vitamin D3 increases their efficiency and ATP output.' },
  muscleFiber:  { pos: ringPos(RING.mid, 2, 4),      class: 'STRUCTURAL', size: 0.40, label: 'Muscle Fiber Growth',    description: 'Muscle fiber hypertrophy. H = k · mTOR · ATP · Ribosome. Fibers expand when synthesis > breakdown.' },
  protSynth:    { pos: ringPos(RING.mid, 3, 4),      class: 'STRUCTURAL', size: 0.38, label: 'Protein Synthesis',      description: 'The protein production engine. Ribosomes translate mRNA into polypeptide chains that build muscle structure.' },
  fatMetab:     { pos: ringPos(RING.outer, 0, 4),    class: 'ENERGY',     size: 0.30, label: 'Fat Metabolism',         description: 'Adipocyte lipolysis releases fatty acids into circulation for energy. Rate controlled by hormonal signals.' },
  glpResponse:  { pos: ringPos(RING.outer, 1, 4),    class: 'NUTRIENT',   size: 0.28, label: 'GLP Response',           description: 'GLP-1 receptor activation suppresses appetite and accelerates fat loss — at risk of muscle catabolism.' },
  murf1:        { pos: ringPos(RING.outer, 2, 4),    class: 'STRUCTURAL', size: 0.28, label: 'MuRF1 / Atrogin-1',     description: 'Ubiquitin ligases that tag muscle proteins for degradation. Maslinic acid blocks this pathway.' },
  pi3k:         { pos: ringPos(RING.outer, 3, 4),    class: 'GROWTH',     size: 0.28, label: 'PI3K',                  description: 'Phosphoinositide 3-kinase initiates the AKT/mTOR anabolic cascade. Activated by growth signals.' },
}

export const EDGES = [
  { from: 'leucine',  to: 'mTOR',        weight: 0.6,  type: 'activating'  },
  { from: 'akt',      to: 'mTOR',        weight: 0.5,  type: 'activating'  },
  { from: 'pi3k',     to: 'akt',         weight: 0.7,  type: 'activating'  },
  { from: 'mTOR',     to: 'ribosome',    weight: 0.8,  type: 'activating'  },
  { from: 'mTOR',     to: 'muscleFiber', weight: 0.5,  type: 'activating'  },
  { from: 'ribosome', to: 'protSynth',   weight: 0.9,  type: 'activating'  },
  { from: 'protSynth',to: 'muscleFiber', weight: 0.6,  type: 'activating'  },
  { from: 'mitochondria','to': 'ampk',   weight: 0.4,  type: 'activating'  },
  { from: 'ampk',     to: 'mTOR',        weight: -0.5, type: 'inhibitory'  },
  { from: 'murf1',    to: 'protSynth',   weight: -0.7, type: 'inhibitory'  },
  { from: 'murf1',    to: 'muscleFiber', weight: -0.5, type: 'inhibitory'  },
  { from: 'glpResponse','to': 'fatMetab',weight: 0.7,  type: 'activating'  },
  { from: 'glpResponse','to': 'murf1',   weight: 0.3,  type: 'activating'  },
  { from: 'fatMetab', to: 'mitochondria',weight: 0.3,  type: 'activating'  },
]

const DECAY = 0.04

export default class PathwayGraph {
  constructor() {
    this.nodes   = {}
    this.edges   = EDGES
    this.blocked = new Set()  // edge 'from→to' strings blocked by maslinic acid

    for (const id of Object.keys(NODES)) {
      this.nodes[id] = { activity: 0, prevActivity: 0 }
    }
  }

  inject(nodeId, amount = 0.5) {
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].activity = Math.min(1, this.nodes[nodeId].activity + amount)
    }
  }

  blockEdge(from, to) { this.blocked.add(`${from}→${to}`) }
  unblockEdge(from, to) { this.blocked.delete(`${from}→${to}`) }

  step(dt) {
    const delta = {}
    for (const id of Object.keys(this.nodes)) delta[id] = 0

    for (const e of this.edges) {
      if (this.blocked.has(`${e.from}→${e.to}`)) continue
      const src = this.nodes[e.from]
      if (!src || !this.nodes[e.to]) continue
      delta[e.to] += src.activity * e.weight * dt * 4
    }

    for (const id of Object.keys(this.nodes)) {
      const n = this.nodes[id]
      n.prevActivity = n.activity
      n.activity = Math.max(0, Math.min(1, n.activity + delta[id] - DECAY * n.activity * dt * 4))
    }
  }

  getActivity(nodeId) { return this.nodes[nodeId]?.activity ?? 0 }

  // Global state metrics
  get hypertrophyRate() {
    const s = this.getActivity('protSynth') * (1 + this.getActivity('ribosome'))
    const b = this.getActivity('murf1')
    return Math.max(0, s - b)
  }

  get energyState() { return this.getActivity('mitochondria') }
}
