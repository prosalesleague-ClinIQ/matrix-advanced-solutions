---
name: r3f-brand-scene
description: Build a premium React Three Fiber brand scene for Matrix using modular geometry, lighting, grouped objects, and performance-safe effects.
---

# R3F Brand Scene Skill

## Scene Standard
Dark, premium, medically futuristic, cinematic, controlled.

## Scene Hierarchy
- Canvas with fixed camera
- Background star field (static points)
- Particle formation system (animated points)
- Camera drift controller (subtle parallax)

## Camera Rules
- Subtle drift: sin/cos oscillation on x/y
- Slow, confident movement
- Always looks at origin
- No fast spinning or game-like movement

## Material Rules
- PointsMaterial with vertexColors and additive blending
- Transparent, no depth write (for proper layering)
- Size attenuation enabled
- Keep sizes small (2–3 pixels)

## Performance Rules
- Disable antialias on Canvas
- DPR capped at 1.5 (1 on mobile)
- No post-processing (bloom too expensive for intro)
- Clean up on unmount
- Dynamic import with ssr: false
