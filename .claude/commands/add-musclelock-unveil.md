# Add MuscleLock Product Unveil

## Overview
Apple-style product unveil intro for the MuscleLock page (/musclelock).

## Files
```
public/musclelock/assets/
├── product-unveil.js    — Self-contained animation (vanilla JS, rAF)
├── product-unveil.css   — Overlay, bottle, label, glow styling
├── bottle-hero.png      — Transparent bottle image (600px)
├── label-wrap.webp      — Full wrap label (1200px, optimized)
└── label-wrap.png       — Original label source
```

## Mount Point
Injected into `public/musclelock/index.html`:
- CSS: `<link>` in `<head>`
- JS: `<script>` before `</body>`

## Animation Sequence
1. Dark stage (0%)
2. Bottle emerges with opacity + scale (0-25%)
3. Label appears and orbits bottle — 2.5 rotations, elliptical path (15-65%)
4. Label shrinks to bottle center and fades (65-80%)
5. Bottle zooms in for hero close-up (70-85%)
6. Bottle eases back slightly (85-95%)
7. Purple/cyan glow halo builds (50-85%)
8. Hold (95-100%) then fade overlay out

## Tuning Notes

### Duration
- Desktop: 4200ms + 900ms hold = ~5.1s total
- Mobile: 3200ms + 900ms hold = ~4.1s total
- Edit `duration` var in product-unveil.js

### Label orbit
- Orbit radius: 240px desktop, 160px mobile
- Rotations: 2.5 (Math.PI * 2.5)
- Elliptical Y compression: 0.3
- Edit in Phase 2 section of animate()

### Zoom timing
- Zoom in: 70-85% progress, scale 1.0 → 1.25
- Zoom out: 85-95%, scale 1.25 → 1.15
- Edit in Phase 4/5 sections

### Glow
- Starts at 50%, max opacity 0.65
- Color: purple center, indigo mid, cyan edge
- Edit in glow section

### Replay
- sessionStorage key: `ml-unveil-played`
- Clears on tab close
- To force replay: `sessionStorage.removeItem('ml-unveil-played')` in console
