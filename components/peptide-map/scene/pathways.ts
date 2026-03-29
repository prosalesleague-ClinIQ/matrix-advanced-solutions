import * as THREE from "three";
import type { SystemId } from "../data/peptide-data";
import { SYSTEM_MAP, PEPTIDES } from "../data/peptide-data";
import {
  PATHWAY_DEFINITIONS,
  REGION_DEFINITIONS,
} from "../data/region-definitions";

const PARTICLES_PER_PATHWAY_DESKTOP = 30;
const PARTICLES_PER_PATHWAY_MOBILE = 12;

interface PathwayInstance {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  offsets: Float32Array;
  fromId: SystemId;
  toId: SystemId;
  peptides: string[];
  particleCount: number;
}

export function createPathways(scene: THREE.Scene, isMobile: boolean) {
  const particlesPerPath = isMobile
    ? PARTICLES_PER_PATHWAY_MOBILE
    : PARTICLES_PER_PATHWAY_DESKTOP;

  const pathways: PathwayInstance[] = [];
  const pathwayGroup = new THREE.Group();

  let activeSystem: SystemId | null = null;
  let activePeptide: string | null = null;

  // Build a lookup for region positions
  const regionPosMap = new Map<SystemId, THREE.Vector3>();
  for (const def of REGION_DEFINITIONS) {
    regionPosMap.set(
      def.id,
      new THREE.Vector3(def.position[0], def.position[1], def.position[2])
    );
  }

  // ─── Create a pathway instance for each definition ────────────────────────
  for (const def of PATHWAY_DEFINITIONS) {
    const fromPos = regionPosMap.get(def.from);
    const toPos = regionPosMap.get(def.to);
    if (!fromPos || !toPos) continue;

    // Build curve with control points
    const curvePoints: THREE.Vector3[] = [fromPos.clone()];

    if (def.controlPoints) {
      for (const cp of def.controlPoints) {
        curvePoints.push(new THREE.Vector3(cp[0], cp[1], cp[2]));
      }
    }

    curvePoints.push(toPos.clone());

    const curve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.5);

    // Determine color: blend from→to system colors
    const fromSystem = SYSTEM_MAP.get(def.from);
    const toSystem = SYSTEM_MAP.get(def.to);
    const fromColor = new THREE.Color(fromSystem?.color ?? "#ffffff");
    const toColor = new THREE.Color(toSystem?.color ?? "#ffffff");

    // Create particle system for this pathway
    const count = particlesPerPath;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
      // Gradient color from start to end
      const t = i / count;
      const color = fromColor.clone().lerp(toColor, t);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.03 : 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    pathwayGroup.add(points);

    pathways.push({
      curve,
      points,
      geometry,
      material,
      offsets,
      fromId: def.from,
      toId: def.to,
      peptides: def.peptides,
      particleCount: count,
    });
  }

  scene.add(pathwayGroup);

  // ─── Determine which pathways should be active ────────────────────────────
  function isPathwayActive(pathway: PathwayInstance): boolean {
    if (activePeptide) {
      // When a specific peptide is focused, show only its pathways
      return pathway.peptides.includes(activePeptide);
    }

    if (activeSystem) {
      // When a system is selected, show all pathways connected to it
      return pathway.fromId === activeSystem || pathway.toId === activeSystem;
    }

    return false;
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  function setActiveSystem(id: SystemId | null) {
    activeSystem = id;
  }

  function setActivePeptide(name: string | null) {
    activePeptide = name;
  }

  function update(elapsed: number) {
    const speed = 0.12;

    for (const pathway of pathways) {
      const active = isPathwayActive(pathway);
      const targetOpacity = active ? 0.7 : 0;

      // Smooth fade
      pathway.material.opacity +=
        (targetOpacity - pathway.material.opacity) * 0.08;

      // Skip position updates for invisible pathways
      if (pathway.material.opacity < 0.01) continue;

      const posAttr = pathway.geometry.attributes
        .position as THREE.BufferAttribute;

      for (let i = 0; i < pathway.particleCount; i++) {
        const t = (pathway.offsets[i] + elapsed * speed) % 1;
        const point = pathway.curve.getPoint(t);

        // Add slight drift for organic feel
        const drift = Math.sin(elapsed * 3 + pathway.offsets[i] * 10) * 0.01;
        posAttr.setXYZ(i, point.x + drift, point.y + drift * 0.5, point.z);
      }

      posAttr.needsUpdate = true;
    }
  }

  function dispose() {
    for (const pathway of pathways) {
      pathway.geometry.dispose();
      pathway.material.dispose();
    }
    scene.remove(pathwayGroup);
  }

  return { setActiveSystem, setActivePeptide, update, dispose };
}
