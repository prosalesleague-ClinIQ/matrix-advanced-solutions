---
name: intro-performance-fallbacks
description: Add reduced-motion, mobile, and WebGL failure fallbacks for the Matrix cinematic logo intro.
---

# Intro Performance Fallbacks Skill

## Reduced Motion
- Detect via `useReducedMotion()` hook
- Skip 3D scene entirely
- Show brief CSS logo reveal (gradient square + glow)
- Auto-dismiss after 800ms

## Mobile
- Reduce particle count (1400 → 600)
- Shorten animation duration (3.5s → 2.8s)
- Lower DPR to 1
- Reduce background star count (400 → 150)

## WebGL Failure
- Test with `canvas.getContext('webgl2') || canvas.getContext('webgl')`
- If fails: show CSS fallback with glowing "M" logo
- Auto-dismiss after 1.5s

## Session Logic
- `sessionStorage.getItem('matrix-intro-played')`
- Set on completion or skip
- Never replay within same session

## Safety
- 7-second hard timeout on the overlay
- Skip button always visible (bottom-right)
- Never trap keyboard navigation (aria-hidden on overlay)

## Quality Rule
All fallbacks must still feel premium — not broken or cheap.
