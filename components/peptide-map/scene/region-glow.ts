import type { SystemId } from "../data/peptide-data";
import { BODY_SYSTEMS } from "../data/peptide-data";

/**
 * Manages lerped glow intensity for each body system.
 * Provides smooth transitions when hovering/selecting regions.
 */

export interface GlowState {
  /** Get the current glow intensity for a given system (0..1) */
  getIntensity(id: SystemId): number;
}

interface SystemGlow {
  current: number;
  target: number;
}

export function createRegionGlow(): GlowState & {
  setHoverTarget: (id: SystemId | null) => void;
  setSelectTarget: (id: SystemId | null) => void;
  update: (delta: number) => void;
} {
  const LERP_SPEED = 6.0; // Higher = faster transitions
  const IDLE_GLOW = 0.15;
  const HOVER_GLOW = 0.6;
  const SELECT_GLOW = 1.0;
  const DIM_GLOW = 0.05; // When another system is selected

  // Initialize glow state for each system
  const glowMap = new Map<SystemId, SystemGlow>();
  for (const sys of BODY_SYSTEMS) {
    glowMap.set(sys.id, { current: IDLE_GLOW, target: IDLE_GLOW });
  }

  let hoveredId: SystemId | null = null;
  let selectedId: SystemId | null = null;

  function setHoverTarget(id: SystemId | null) {
    hoveredId = id;
    recalcTargets();
  }

  function setSelectTarget(id: SystemId | null) {
    selectedId = id;
    recalcTargets();
  }

  function recalcTargets() {
    for (const [id, glow] of glowMap) {
      if (id === selectedId) {
        glow.target = SELECT_GLOW;
      } else if (id === hoveredId && !selectedId) {
        glow.target = HOVER_GLOW;
      } else if (selectedId) {
        // Another system is selected — dim everything else
        glow.target = id === hoveredId ? HOVER_GLOW * 0.5 : DIM_GLOW;
      } else {
        glow.target = IDLE_GLOW;
      }
    }
  }

  function update(delta: number) {
    const lerpFactor = 1.0 - Math.exp(-LERP_SPEED * delta);
    for (const glow of glowMap.values()) {
      glow.current += (glow.target - glow.current) * lerpFactor;
    }
  }

  function getIntensity(id: SystemId): number {
    return glowMap.get(id)?.current ?? IDLE_GLOW;
  }

  return { setHoverTarget, setSelectTarget, update, getIntensity };
}
