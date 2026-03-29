import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { MutableRefObject } from "react";

import type { SceneCallbacks } from "../peptide-map-canvas";
import type { SceneState } from "../peptide-map-page";
import { createPeptideMapLighting } from "./lighting";
import { createBody } from "./body";
import { createScanEffect } from "./scan-effect";
import { createRegions } from "./regions";
import { createRegionGlow } from "./region-glow";
import { createPeptideMapInteractions } from "./interactions";
import { createCameraController } from "./camera-controller";
import { createPathways } from "./pathways";

export function initPeptideMapScene(
  canvas: HTMLCanvasElement,
  callbacks: SceneCallbacks,
  stateRef: MutableRefObject<SceneState>
) {
  const isMobile = window.innerWidth < 768;

  // ─── Renderer ───────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ─── Scene ──────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b1e);
  scene.fog = new THREE.FogExp2(0x050b1e, 0.08);

  // ─── Camera ─────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.3, 3.8);
  camera.lookAt(0, 0.3, 0);

  // ─── Post Processing ────────────────────────────────────────────────────
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.6 : 0.9,
    0.4,
    0.5
  );
  composer.addPass(bloomPass);

  // ─── Modules ────────────────────────────────────────────────────────────
  createPeptideMapLighting(scene);
  const body = createBody(scene, isMobile);
  const scan = createScanEffect(scene);
  const regions = createRegions(scene);
  const glow = createRegionGlow();
  const cameraCtrl = createCameraController(camera);
  const interactions = createPeptideMapInteractions(
    camera,
    canvas,
    regions.getHitTargets(),
    callbacks
  );
  const pathways = createPathways(scene, isMobile);

  // ─── Animation Loop ─────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let animFrameId: number;

  function animate() {
    animFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Read React state
    const { hoveredSystem, selectedSystem, focusedPeptide } = stateRef.current;

    // Update glow states
    glow.setHoverTarget(hoveredSystem);
    glow.setSelectTarget(selectedSystem);
    glow.update(delta);

    // Apply glow to regions
    regions.setHovered(hoveredSystem);
    regions.setSelected(selectedSystem);

    // Update modules
    body.update(elapsed);
    scan.update(elapsed);
    regions.update(elapsed, glow);
    interactions.update();
    cameraCtrl.setFocusTarget(selectedSystem, regions.getRegionPosition(selectedSystem));
    cameraCtrl.update(delta);
    pathways.setActiveSystem(selectedSystem);
    pathways.setActivePeptide(focusedPeptide);
    pathways.update(elapsed);

    composer.render();
  }

  animate();

  // ─── Resize ─────────────────────────────────────────────────────────────
  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(w, h);
  }

  window.addEventListener("resize", handleResize);

  // ─── Cleanup ────────────────────────────────────────────────────────────
  function dispose() {
    cancelAnimationFrame(animFrameId);
    window.removeEventListener("resize", handleResize);
    body.dispose();
    scan.dispose();
    regions.dispose();
    interactions.dispose();
    cameraCtrl.dispose();
    pathways.dispose();
    renderer.dispose();
  }

  return { dispose };
}
