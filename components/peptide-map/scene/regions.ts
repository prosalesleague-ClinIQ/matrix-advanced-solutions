import * as THREE from "three";
import type { SystemId } from "../data/peptide-data";
import { SYSTEM_MAP } from "../data/peptide-data";
import { REGION_DEFINITIONS } from "../data/region-definitions";
import type { GlowState } from "./region-glow";

interface RegionMeshes {
  id: SystemId;
  /** Visible glowing ellipsoid */
  glow: THREE.Mesh;
  /** Pulsing ring indicator */
  ring: THREE.Mesh;
  /** Invisible hit-target sphere for raycasting */
  hitTarget: THREE.Mesh;
  position: THREE.Vector3;
  color: THREE.Color;
}

export function createRegions(scene: THREE.Scene) {
  const regionGroup = new THREE.Group();
  const regions: RegionMeshes[] = [];
  const hitTargets: THREE.Mesh[] = [];

  let hoveredId: SystemId | null = null;
  let selectedId: SystemId | null = null;

  for (const def of REGION_DEFINITIONS) {
    const system = SYSTEM_MAP.get(def.id);
    if (!system) continue;

    const color = new THREE.Color(system.color);
    const pos = new THREE.Vector3(
      def.position[0],
      def.position[1],
      def.position[2]
    );

    // ─── Visible glow ellipsoid ─────────────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(1, 16, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(pos);
    glow.scale.set(def.scale[0], def.scale[1], def.scale[2]);
    regionGroup.add(glow);

    // ─── Pulsing ring ───────────────────────────────────────────────────
    const ringGeo = new THREE.RingGeometry(0.85, 1.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.position.z += 0.01;
    const avgScale = (def.scale[0] + def.scale[1]) / 2;
    ring.scale.setScalar(avgScale);
    regionGroup.add(ring);

    // ─── Invisible hit-target sphere ────────────────────────────────────
    const hitGeo = new THREE.SphereGeometry(def.hitRadius, 8, 6);
    const hitMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const hitTarget = new THREE.Mesh(hitGeo, hitMat);
    hitTarget.position.copy(pos);
    hitTarget.userData.systemId = def.id;
    regionGroup.add(hitTarget);
    hitTargets.push(hitTarget);

    regions.push({ id: def.id, glow, ring, hitTarget, position: pos, color });
  }

  scene.add(regionGroup);

  // ─── Public API ───────────────────────────────────────────────────────────
  function getHitTargets(): THREE.Mesh[] {
    return hitTargets;
  }

  function getRegionPosition(id: SystemId | null): THREE.Vector3 | null {
    if (!id) return null;
    const r = regions.find((r) => r.id === id);
    return r ? r.position.clone() : null;
  }

  function setHovered(id: SystemId | null) {
    hoveredId = id;
  }

  function setSelected(id: SystemId | null) {
    selectedId = id;
  }

  function update(elapsed: number, glow: GlowState) {
    for (const region of regions) {
      const intensity = glow.getIntensity(region.id);
      const mat = region.glow.material as THREE.MeshBasicMaterial;

      // Base opacity from glow intensity — keep subtle
      mat.opacity = 0.015 + intensity * 0.08;

      // Pulse scale on hover/select
      const isActive =
        region.id === hoveredId || region.id === selectedId;
      const pulse = isActive ? 1.0 + Math.sin(elapsed * 3) * 0.08 : 1.0;
      const def = REGION_DEFINITIONS.find((d) => d.id === region.id)!;
      region.glow.scale.set(
        def.scale[0] * pulse,
        def.scale[1] * pulse,
        def.scale[2] * pulse
      );

      // Ring visibility and animation
      const ringMat = region.ring.material as THREE.MeshBasicMaterial;
      if (isActive) {
        const ringPulse = (Math.sin(elapsed * 4) + 1) * 0.5;
        ringMat.opacity = 0.06 + ringPulse * 0.12;
        region.ring.scale.setScalar(
          ((def.scale[0] + def.scale[1]) / 2) * (1.0 + ringPulse * 0.1)
        );
        region.ring.rotation.z = elapsed * 0.5;
      } else {
        ringMat.opacity *= 0.92; // Fade out
      }
    }
  }

  function dispose() {
    regions.forEach((r) => {
      r.glow.geometry.dispose();
      (r.glow.material as THREE.MeshBasicMaterial).dispose();
      r.ring.geometry.dispose();
      (r.ring.material as THREE.MeshBasicMaterial).dispose();
      r.hitTarget.geometry.dispose();
      (r.hitTarget.material as THREE.MeshBasicMaterial).dispose();
    });
    scene.remove(regionGroup);
  }

  return {
    getHitTargets,
    getRegionPosition,
    setHovered,
    setSelected,
    update,
    dispose,
  };
}
