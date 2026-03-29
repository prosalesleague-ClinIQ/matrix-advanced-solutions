import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { BODY_PARTS } from "../data/region-definitions";

/** Total desktop / mobile point counts */
const DESKTOP_POINTS = 3000;
const MOBILE_POINTS = 1200;

export function createBody(scene: THREE.Scene, isMobile: boolean) {
  const totalPoints = isMobile ? MOBILE_POINTS : DESKTOP_POINTS;

  // ─── Calculate total density weight to distribute points proportionally ───
  const totalWeight = BODY_PARTS.reduce((sum, p) => sum + p.pointDensity, 0);

  const allPositions: number[] = [];

  // ─── Sample points from each body part ────────────────────────────────────
  for (const part of BODY_PARTS) {
    const count = Math.round((part.pointDensity / totalWeight) * totalPoints);
    if (count === 0) continue;

    // Create temporary mesh geometry
    let geo: THREE.BufferGeometry;

    if (part.type === "sphere") {
      geo = new THREE.SphereGeometry(part.params[0], 16, 12);
    } else if (part.type === "cylinder") {
      geo = new THREE.CylinderGeometry(
        part.params[0],
        part.params[1],
        part.params[2],
        12,
        4
      );
    } else {
      // capsule
      geo = new THREE.CapsuleGeometry(part.params[0], part.params[1], 8, 12);
    }

    const mat = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geo, mat);

    // Apply position
    mesh.position.set(part.position[0], part.position[1], part.position[2]);

    // Apply rotation if specified
    if (part.rotation) {
      mesh.rotation.set(part.rotation[0], part.rotation[1], part.rotation[2]);
    }

    mesh.updateMatrixWorld(true);

    // Bake the transform into the geometry so sampler works in world space
    const bakedGeo = geo.clone();
    bakedGeo.applyMatrix4(mesh.matrixWorld);

    const bakedMesh = new THREE.Mesh(bakedGeo, mat);
    const sampler = new MeshSurfaceSampler(bakedMesh).build();

    const tempPos = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      sampler.sample(tempPos);
      // Add slight inward jitter for volume feel
      const jitter = (Math.random() - 0.5) * 0.02;
      allPositions.push(
        tempPos.x + jitter,
        tempPos.y + jitter,
        tempPos.z + jitter
      );
    }

    // Cleanup temp
    geo.dispose();
    bakedGeo.dispose();
    mat.dispose();
  }

  // ─── Create points geometry ───────────────────────────────────────────────
  const pointCount = allPositions.length / 3;
  const positions = new Float32Array(allPositions);
  const colors = new Float32Array(pointCount * 3);
  const noiseOffsets = new Float32Array(pointCount);

  const baseColor = new THREE.Color(0x4ad6ff);
  const altColor = new THREE.Color(0xd44cff);

  for (let i = 0; i < pointCount; i++) {
    const t = Math.random();
    const color = baseColor.clone().lerp(altColor, t * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    noiseOffsets[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute(
    "noiseOffset",
    new THREE.BufferAttribute(noiseOffsets, 1)
  );

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.025 : 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ─── Wireframe skeleton ───────────────────────────────────────────────────
  const wireframeGroup = new THREE.Group();

  for (const part of BODY_PARTS) {
    let geo: THREE.BufferGeometry;

    if (part.type === "sphere") {
      geo = new THREE.SphereGeometry(part.params[0], 8, 6);
    } else if (part.type === "cylinder") {
      geo = new THREE.CylinderGeometry(
        part.params[0],
        part.params[1],
        part.params[2],
        8,
        2
      );
    } else {
      geo = new THREE.CapsuleGeometry(part.params[0], part.params[1], 4, 8);
    }

    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4ad6ff,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.LineSegments(edges, lineMat);
    line.position.set(part.position[0], part.position[1], part.position[2]);
    if (part.rotation) {
      line.rotation.set(part.rotation[0], part.rotation[1], part.rotation[2]);
    }
    wireframeGroup.add(line);

    geo.dispose();
  }

  scene.add(wireframeGroup);

  // ─── Stored original Y positions for breathing ───────────────────────────
  const originalPositions = new Float32Array(positions);

  // ─── Update (breathing + shimmer) ─────────────────────────────────────────
  function update(elapsed: number) {
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const noiseAttr = geometry.attributes.noiseOffset as THREE.BufferAttribute;

    // Breathing: gentle Y-scale oscillation on torso points
    const breathAmt = Math.sin(elapsed * 1.2) * 0.008;

    for (let i = 0; i < pointCount; i++) {
      const oy = originalPositions[i * 3 + 1];
      // Only apply breathing to torso region (Y between -0.3 and 1.0)
      if (oy > -0.3 && oy < 1.0) {
        const factor = 1.0 - Math.abs(oy - 0.35) / 0.65;
        posAttr.setY(i, oy + breathAmt * factor);
      }

      // Shimmer: subtle position jitter
      const noise = noiseAttr.getX(i);
      const shimmer = Math.sin(elapsed * 2.0 + noise) * 0.002;
      posAttr.setX(i, originalPositions[i * 3] + shimmer);
    }

    posAttr.needsUpdate = true;

    // Animate wireframe opacity subtly
    const wireOpacity = 0.04 + Math.sin(elapsed * 0.8) * 0.02;
    wireframeGroup.children.forEach((child) => {
      const line = child as THREE.LineSegments;
      (line.material as THREE.LineBasicMaterial).opacity = wireOpacity;
    });
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  function dispose() {
    geometry.dispose();
    material.dispose();
    scene.remove(points);

    wireframeGroup.children.forEach((child) => {
      const line = child as THREE.LineSegments;
      line.geometry.dispose();
      (line.material as THREE.LineBasicMaterial).dispose();
    });
    scene.remove(wireframeGroup);
  }

  return { update, dispose };
}
