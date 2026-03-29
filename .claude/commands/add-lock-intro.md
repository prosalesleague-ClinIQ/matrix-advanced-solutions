# Add Lock Intro

## Overview
The Matrix site includes a cinematic first-load intro overlay where particles form the DNA lock logo.

## File Structure
```
components/intro/
├── intro-overlay.tsx    — Orchestration, session logic, fallbacks
├── intro-scene.tsx      — R3F canvas with particles and camera
└── logo-target.ts       — Target position generation for logo zones
```

## Mount Point
`app/layout.tsx` — `<IntroOverlay />` placed before `<Header />`

## Key Behaviors
- Plays once per session (sessionStorage)
- 3D scene dynamically imported (ssr: false)
- GSAP timeline controls 4-phase animation
- Framer Motion handles overlay exit fade
- Skip button always available

## Tuning Notes

### Particle Count
- Desktop: 1400 in `intro-scene.tsx` (`count` variable)
- Mobile: 600
- Background stars: 400/150

### Duration
- Desktop: 3.5s formation + 0.8s hold = ~4.3s total
- Mobile: 2.8s formation + 0.8s hold = ~3.6s total
- Adjust in GSAP timeline `duration` parameter

### Replay Behavior
- Change session key: `SESSION_KEY` in `intro-overlay.tsx`
- To replay every visit: use localStorage instead of sessionStorage
- To disable: remove `<IntroOverlay />` from layout

### Logo Shape
- Edit zone generators in `logo-target.ts`
- Each zone function returns Vec3 array
- Distribution percentages control particle allocation

### Colors
- Zone colors defined in `zoneColors` record in `logo-target.ts`
- Initial star colors in `initialColors` array in `intro-scene.tsx`
