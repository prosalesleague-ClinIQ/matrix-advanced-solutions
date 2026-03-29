import * as THREE from "three";

/** Creates a horizontal holographic scan line that sweeps vertically through the body */
export function createScanEffect(scene: THREE.Scene) {
  // Scan plane — thin horizontal band
  const geometry = new THREE.PlaneGeometry(1.6, 0.008);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4ad6ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const scanLine = new THREE.Mesh(geometry, material);
  scanLine.position.set(0, -1.5, 0.2);
  scene.add(scanLine);

  // Glow plane — wider, more transparent halo around the scan line
  const glowGeo = new THREE.PlaneGeometry(1.8, 0.06);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4ad6ff,
    transparent: true,
    opacity: 0.025,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const glowPlane = new THREE.Mesh(glowGeo, glowMat);
  glowPlane.position.set(0, -1.5, 0.19);
  scene.add(glowPlane);

  // Scan range (body from bottom of legs to top of head)
  const SCAN_BOTTOM = -1.5;
  const SCAN_TOP = 1.6;
  const SCAN_RANGE = SCAN_TOP - SCAN_BOTTOM;
  const SCAN_SPEED = 0.25; // slower for elegance

  function update(elapsed: number) {
    // Triangle wave: 0 → 1 → 0 (smooth up/down sweep)
    const raw = (elapsed * SCAN_SPEED) % 2;
    const t = raw < 1 ? raw : 2 - raw;
    const y = SCAN_BOTTOM + t * SCAN_RANGE;

    scanLine.position.y = y;
    glowPlane.position.y = y;

    // Pulse opacity at edges — brighter in the middle of the sweep
    const centeredness = 1.0 - Math.abs(t - 0.5) * 2;
    material.opacity = 0.06 + centeredness * 0.08;
    glowMat.opacity = 0.01 + centeredness * 0.025;
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    glowGeo.dispose();
    glowMat.dispose();
    scene.remove(scanLine);
    scene.remove(glowPlane);
  }

  return { update, dispose };
}
