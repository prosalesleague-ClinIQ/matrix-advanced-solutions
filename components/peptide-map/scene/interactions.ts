import * as THREE from "three";
import type { SystemId } from "../data/peptide-data";
import type { SceneCallbacks } from "../peptide-map-canvas";

/**
 * Raycaster-based interaction system for hovering and clicking body regions.
 * Runs raycasting in the animation loop (not on pointer events) for smooth hover.
 */
export function createPeptideMapInteractions(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  hitTargets: THREE.Mesh[],
  callbacks: SceneCallbacks
) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let currentHovered: SystemId | null = null;

  // Track pointer position for click detection
  let pointerDownPos = { x: 0, y: 0 };
  let isPointerDown = false;
  const CLICK_THRESHOLD = 5; // px max drag distance to count as click

  // ─── Pointer event handlers ───────────────────────────────────────────────
  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(e: PointerEvent) {
    isPointerDown = true;
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPointerDown) return;
    isPointerDown = false;

    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CLICK_THRESHOLD) {
      // This is a click, not a drag
      handleClick();
    }
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    pointerDownPos = { x: touch.clientX, y: touch.clientY };
    isPointerDown = true;
  }

  function onTouchEnd(e: TouchEvent) {
    if (!isPointerDown) return;
    isPointerDown = false;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - pointerDownPos.x;
    const dy = touch.clientY - pointerDownPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CLICK_THRESHOLD) {
      // Mobile: first tap = hover + select simultaneously
      handleClick();
    }
  }

  function handleClick() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(hitTargets);

    if (intersects.length > 0) {
      const systemId = intersects[0].object.userData.systemId as SystemId;
      callbacks.onSystemSelect(systemId);
    } else {
      callbacks.onSystemSelect(null);
    }
  }

  // ─── Attach listeners ─────────────────────────────────────────────────────
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd);

  // ─── Update (called in animation loop) ────────────────────────────────────
  function update() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(hitTargets);

    let newHovered: SystemId | null = null;
    if (intersects.length > 0) {
      newHovered = intersects[0].object.userData.systemId as SystemId;
    }

    if (newHovered !== currentHovered) {
      currentHovered = newHovered;
      callbacks.onSystemHover(currentHovered);
      canvas.style.cursor = currentHovered ? "pointer" : "default";
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  function dispose() {
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.style.cursor = "default";
  }

  return { update, dispose };
}
