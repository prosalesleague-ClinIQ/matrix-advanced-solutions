---
name: 3d-motion
description: Use this skill when building any animation, hero scene, reveal sequence, 3D environment, hover effect, or cinematic section transition.
---

# 3D and Motion Skill

## When to use 3D
- Homepage hero atmospheric environment
- Subtle molecular/network animation
- Depth and immersion enhancement
- NOT for every section, form pages, or small utility cards

## Motion principles
- Slow enough to feel confident
- Directional, layered, purposeful
- No jitter, excessive bounce, or competing motion systems
- Ease: [0.22, 1, 0.36, 1] for most reveals

## Section reveal choreography
1. eyebrow → 2. headline → 3. subhead → 4. content → 5. CTA
- Stagger: 0.05–0.1s between items
- Duration: 0.4–0.7s per element
- Use `whileInView` with `viewport={{ once: true, margin: '-60px' }}`

## Reduced motion — mandatory
- Remove parallax, unnecessary transforms, particle systems
- Simplify or disable scroll-linked animation
- Provide static gradient fallback for 3D scenes
- Check: `useReducedMotion()` hook

## Mobile fallbacks
- Reduce animation count and particle density
- Simplify 3D scenes or replace with 2D
- Prioritize legibility and performance

## React Three Fiber rules
- Keep scenes lightweight, isolated, easy to disable
- Low geometry counts, minimal lights, memoize where useful
- Lazy load 3D if possible
- dpr={[1, 1.5]}, no more than 40-50 nodes for network

## Hero rules
- Visual behind/beside headline, never competing
- Motion supports depth, doesn't steal attention
- CTA row must stay clear and stable

## Glow/particle limits
- Subtle drift only, low-density fields
- Glow must be directional and restrained
- No fireworks, dust storms, or full-screen glow fog

## Hover limits
- Slight y-translation, slight scale < 1.02, shadow refinement
- No exaggerated scale, flip, rapid pulse, or spin
