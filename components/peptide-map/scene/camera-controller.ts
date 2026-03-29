import * as THREE from "three";
import type { SystemId } from "../data/peptide-data";

/**
 * Camera controller with:
 * - Mouse parallax (subtle camera offset following pointer)
 * - Auto-rotate (slow Y-axis orbit when idle)
 * - Focus-on-select (smooth transition toward selected region)
 */
export function createCameraController(camera: THREE.PerspectiveCamera) {
  // ─── Configuration ────────────────────────────────────────────────────────
  const REST_POSITION = new THREE.Vector3(0, 0.3, 3.8);
  const REST_LOOK_AT = new THREE.Vector3(0, 0.3, 0);
  const PARALLAX_STRENGTH = 0.15;
  const AUTO_ROTATE_SPEED = 0.08;
  const FOCUS_LERP_SPEED = 2.5;
  const FOCUS_ZOOM_DISTANCE = 2.8;

  // ─── State ────────────────────────────────────────────────────────────────
  let mouseX = 0;
  let mouseY = 0;
  let focusTarget: THREE.Vector3 | null = null;
  let _selectedId: SystemId | null = null;
  let autoRotateAngle = 0;

  // Smoothed values for interpolation
  const currentPosition = REST_POSITION.clone();
  const currentLookAt = REST_LOOK_AT.clone();
  const targetPosition = REST_POSITION.clone();
  const targetLookAt = REST_LOOK_AT.clone();

  // ─── Mouse tracking ──────────────────────────────────────────────────────
  function onMouseMove(e: MouseEvent) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener("mousemove", onMouseMove);

  // ─── Public API ───────────────────────────────────────────────────────────
  function setFocusTarget(
    id: SystemId | null,
    position: THREE.Vector3 | null
  ) {
    _selectedId = id;
    focusTarget = position;
  }

  function update(delta: number) {
    const lerpFactor = 1.0 - Math.exp(-FOCUS_LERP_SPEED * delta);

    if (focusTarget && _selectedId) {
      // ─── Focused mode: camera moves toward selected region ──────────
      // Calculate position: slightly offset from the focus point
      const focusDir = new THREE.Vector3()
        .subVectors(focusTarget, REST_LOOK_AT)
        .normalize();

      // Position the camera so the region is centered but not obscured
      targetPosition.set(
        focusTarget.x + focusDir.x * 0.3 + PARALLAX_STRENGTH * mouseX * 0.3,
        focusTarget.y + 0.15 + PARALLAX_STRENGTH * mouseY * 0.2,
        FOCUS_ZOOM_DISTANCE
      );

      targetLookAt.copy(focusTarget);
      targetLookAt.y += 0.05;
    } else {
      // ─── Idle mode: auto-rotate + parallax ──────────────────────────
      autoRotateAngle += AUTO_ROTATE_SPEED * delta;

      const rotateX = Math.sin(autoRotateAngle) * 0.2;
      const rotateZ = Math.cos(autoRotateAngle) * 0.15;

      targetPosition.set(
        REST_POSITION.x + rotateX + mouseX * PARALLAX_STRENGTH,
        REST_POSITION.y + mouseY * PARALLAX_STRENGTH * 0.5,
        REST_POSITION.z + rotateZ
      );

      targetLookAt.copy(REST_LOOK_AT);
    }

    // ─── Smooth interpolation ───────────────────────────────────────────
    currentPosition.lerp(targetPosition, lerpFactor);
    currentLookAt.lerp(targetLookAt, lerpFactor);

    camera.position.copy(currentPosition);
    camera.lookAt(currentLookAt);
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  function dispose() {
    window.removeEventListener("mousemove", onMouseMove);
  }

  return { setFocusTarget, update, dispose };
}
