import type { SystemId } from "./peptide-data";

// ─── Region Definitions ─────────────────────────────────────────────────────

export interface RegionDefinition {
  id: SystemId;
  position: [number, number, number];
  scale: [number, number, number];
  hitRadius: number;
}

export const REGION_DEFINITIONS: RegionDefinition[] = [
  {
    id: "neurological",
    position: [0, 1.35, 0.05],
    scale: [0.22, 0.22, 0.2],
    hitRadius: 0.25,
  },
  {
    id: "libido_neurohormonal",
    position: [0.12, 1.12, 0.08],
    scale: [0.12, 0.1, 0.1],
    hitRadius: 0.14,
  },
  {
    id: "hormonal",
    position: [-0.1, 0.92, 0.08],
    scale: [0.12, 0.1, 0.1],
    hitRadius: 0.14,
  },
  {
    id: "immune",
    position: [-0.18, 0.55, 0.1],
    scale: [0.14, 0.16, 0.1],
    hitRadius: 0.18,
  },
  {
    id: "cardiovascular",
    position: [0.12, 0.5, 0.12],
    scale: [0.16, 0.16, 0.12],
    hitRadius: 0.18,
  },
  {
    id: "metabolism",
    position: [0, 0.05, 0.08],
    scale: [0.25, 0.28, 0.15],
    hitRadius: 0.3,
  },
  {
    id: "cellular_repair",
    position: [0.28, 0.65, 0.05],
    scale: [0.12, 0.12, 0.1],
    hitRadius: 0.15,
  },
  {
    id: "skin_hair",
    position: [-0.35, 0.3, 0.15],
    scale: [0.14, 0.14, 0.08],
    hitRadius: 0.16,
  },
  {
    id: "mitochondrial",
    position: [0.3, -0.05, 0.05],
    scale: [0.13, 0.13, 0.1],
    hitRadius: 0.16,
  },
  {
    id: "muscle_recovery",
    position: [0, -0.7, 0.05],
    scale: [0.22, 0.35, 0.12],
    hitRadius: 0.35,
  },
];

// ─── Pathway Definitions ────────────────────────────────────────────────────

export interface PathwayDefinition {
  from: SystemId;
  to: SystemId;
  peptides: string[];
  controlPoints?: [number, number, number][];
}

export const PATHWAY_DEFINITIONS: PathwayDefinition[] = [
  // BPC-157 connections (Muscle ↔ Immune ↔ Cardiovascular)
  {
    from: "muscle_recovery",
    to: "immune",
    peptides: ["BPC-157", "TB-500"],
    controlPoints: [[-0.2, -0.1, 0.15]],
  },
  {
    from: "muscle_recovery",
    to: "cardiovascular",
    peptides: ["BPC-157"],
    controlPoints: [[0.15, -0.1, 0.15]],
  },
  {
    from: "immune",
    to: "cardiovascular",
    peptides: ["BPC-157"],
    controlPoints: [[0, 0.55, 0.2]],
  },

  // Epitalon connections (Neurological ↔ Cellular Repair ↔ Skin/Hair)
  {
    from: "neurological",
    to: "cellular_repair",
    peptides: ["Epitalon"],
    controlPoints: [[0.2, 1.0, 0.1]],
  },
  {
    from: "cellular_repair",
    to: "skin_hair",
    peptides: ["Epitalon", "GHK-Cu"],
    controlPoints: [[0, 0.48, 0.15]],
  },
  {
    from: "neurological",
    to: "skin_hair",
    peptides: ["Epitalon"],
    controlPoints: [[-0.25, 0.85, 0.15]],
  },

  // GHK-Cu connections (Cellular Repair ↔ Cardiovascular ↔ Skin/Hair)
  {
    from: "cardiovascular",
    to: "skin_hair",
    peptides: ["GHK-Cu"],
    controlPoints: [[-0.15, 0.4, 0.2]],
  },
  {
    from: "cellular_repair",
    to: "cardiovascular",
    peptides: ["GHK-Cu"],
    controlPoints: [[0.22, 0.58, 0.12]],
  },

  // MOTS-c connections (Neurological ↔ Mitochondrial)
  {
    from: "neurological",
    to: "mitochondrial",
    peptides: ["MOTS-c"],
    controlPoints: [[0.2, 0.65, 0.1]],
  },

  // Hormonal ↔ Metabolism (functional link)
  {
    from: "hormonal",
    to: "metabolism",
    peptides: ["Ipamorelin", "CJC-1295", "Tesamorelin"],
    controlPoints: [[-0.1, 0.5, 0.12]],
  },

  // Libido ↔ Neurological
  {
    from: "libido_neurohormonal",
    to: "neurological",
    peptides: ["PT-141", "Oxytocin"],
    controlPoints: [[0.08, 1.25, 0.1]],
  },

  // Immune ↔ Neurological (neuro-immune axis)
  {
    from: "immune",
    to: "neurological",
    peptides: ["Selank"],
    controlPoints: [[-0.15, 0.95, 0.12]],
  },
];

// ─── Body Part Definitions (for procedural silhouette) ──────────────────────

export interface BodyPartDef {
  type: "sphere" | "cylinder" | "capsule";
  position: [number, number, number];
  rotation?: [number, number, number];
  params: number[]; // sphere: [radius] | cylinder: [radiusTop, radiusBottom, height] | capsule: [radius, length]
  pointDensity: number; // relative density multiplier
}

export const BODY_PARTS: BodyPartDef[] = [
  // ── Head & Neck ────────────────────────────────────────────
  { type: "sphere", position: [0, 1.35, 0], params: [0.18], pointDensity: 1.5 },
  { type: "cylinder", position: [0, 1.1, 0], params: [0.06, 0.07, 0.15], pointDensity: 0.8 },

  // ── Torso ──────────────────────────────────────────────────
  { type: "cylinder", position: [0, 0.75, 0], params: [0.25, 0.22, 0.5], pointDensity: 1.2 },
  { type: "cylinder", position: [0, 0.2, 0], params: [0.22, 0.2, 0.6], pointDensity: 1.0 },
  { type: "sphere", position: [0, -0.15, 0], params: [0.22], pointDensity: 0.8 },

  // ── Shoulders (spheres bridging torso edge → upper arm) ────
  { type: "sphere", position: [-0.25, 0.9, 0], params: [0.09], pointDensity: 0.5 },
  { type: "sphere", position: [0.25, 0.9, 0], params: [0.09], pointDensity: 0.5 },

  // ── Upper arms (top end at shoulder, bottom end at elbow) ──
  // Left:  center [-0.335, 0.68], rotation tilts top toward body
  { type: "cylinder", position: [-0.335, 0.68, 0.01], rotation: [0, 0, -0.34], params: [0.065, 0.055, 0.45], pointDensity: 0.7 },
  // Right: mirrored
  { type: "cylinder", position: [0.335, 0.68, 0.01], rotation: [0, 0, 0.34], params: [0.065, 0.055, 0.45], pointDensity: 0.7 },

  // ── Elbows (sphere connectors) ─────────────────────────────
  { type: "sphere", position: [-0.42, 0.46, 0.02], params: [0.05], pointDensity: 0.4 },
  { type: "sphere", position: [0.42, 0.46, 0.02], params: [0.05], pointDensity: 0.4 },

  // ── Lower arms (elbow → wrist) ─────────────────────────────
  { type: "cylinder", position: [-0.46, 0.29, 0.03], rotation: [0.1, 0, -0.23], params: [0.05, 0.038, 0.35], pointDensity: 0.6 },
  { type: "cylinder", position: [0.46, 0.29, 0.03], rotation: [0.1, 0, 0.23], params: [0.05, 0.038, 0.35], pointDensity: 0.6 },

  // ── Hands (small spheres at wrist) ─────────────────────────
  { type: "sphere", position: [-0.50, 0.12, 0.04], params: [0.04], pointDensity: 0.3 },
  { type: "sphere", position: [0.50, 0.12, 0.04], params: [0.04], pointDensity: 0.3 },

  // ── Legs (unchanged) ──────────────────────────────────────
  { type: "cylinder", position: [-0.1, -0.55, 0], rotation: [0, 0, 0.03], params: [0.08, 0.065, 0.5], pointDensity: 0.8 },
  { type: "cylinder", position: [0.1, -0.55, 0], rotation: [0, 0, -0.03], params: [0.08, 0.065, 0.5], pointDensity: 0.8 },
  { type: "cylinder", position: [-0.12, -1.1, 0], params: [0.055, 0.04, 0.45], pointDensity: 0.6 },
  { type: "cylinder", position: [0.12, -1.1, 0], params: [0.055, 0.04, 0.45], pointDensity: 0.6 },
];
