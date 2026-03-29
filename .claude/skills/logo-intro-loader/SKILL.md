---
name: logo-intro-loader
description: Build a premium first-load fullscreen intro where stars swirl together and form the Matrix DNA lock logo before revealing the current site.
---

# Logo Intro Loader Skill

## Goal
Create a cinematic intro overlay that plays once per session on first load.

## Animation Sequence
1. Dark screen with distant star field
2. Stars begin subtle drift
3. Rotational pull begins — particles gain spiral velocity
4. Stars accelerate into spiral convergence toward center
5. Logo silhouette emerges from converging particles
6. DNA lock shape resolves with branded colors
7. Logo holds briefly (~800ms)
8. Overlay fades out, revealing main site

## Duration
Target 2.5–4.5 seconds total. Mobile can be shorter (2.8s).

## Session Logic
- Use sessionStorage key `matrix-intro-played`
- Play once per session, skip on subsequent navigations
- Safety timeout at 7s to never trap users

## Integration
- Mount `<IntroOverlay />` in root layout, above Header
- Uses `position: fixed; z-index: 9999` to cover everything
- Does not interfere with routing, Peptide Map, or MuscleLock

## Files
- `components/intro/intro-overlay.tsx` — orchestration, session logic, fallbacks
- `components/intro/intro-scene.tsx` — R3F canvas with particle system
- `components/intro/logo-target.ts` — target position generation for DNA lock shape
