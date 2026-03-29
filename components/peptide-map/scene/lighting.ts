import * as THREE from "three";

export function createPeptideMapLighting(scene: THREE.Scene) {
  // Key light — warm from upper right
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
  keyLight.position.set(4, 6, 3);
  scene.add(keyLight);

  // Fill light — magenta from left
  const fillLight = new THREE.DirectionalLight(0xd44cff, 0.25);
  fillLight.position.set(-5, 2, 2);
  scene.add(fillLight);

  // Rim light — cyan from behind
  const rimLight = new THREE.DirectionalLight(0x4ad6ff, 0.5);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  // Ambient — very subtle
  const ambient = new THREE.AmbientLight(0x1a1a2e, 0.2);
  scene.add(ambient);

  return { keyLight, fillLight, rimLight, ambient };
}
