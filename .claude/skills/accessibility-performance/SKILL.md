---
name: accessibility-performance
description: Use this skill when reviewing or building components, layouts, animations, media, and interactions to protect usability and speed.
---

# Accessibility and Performance Skill

## Semantic HTML
- Use header, nav, main, section, footer, button, a correctly
- Don't use divs where semantics matter

## Contrast
- Body text readable on dark surfaces
- Check button text, secondary text, focus states
- Avoid gray-on-gray copy

## Keyboard navigation
- Every interactive element reachable by keyboard
- Logical focus order
- No hover-only essential interactions

## Focus states
- Visible and intentional: `focus-visible:ring-2 focus-visible:ring-accent-blue`
- Never remove outlines without replacement

## Reduced motion — mandatory
- `useReducedMotion()` hook available
- CSS: `@media (prefers-reduced-motion: reduce)` in globals.css
- Simplify all animations, remove parallax, disable scroll-linked effects

## Lazy loading
- Heavy images below fold
- 3D modules via Suspense
- Don't lazy load above-fold essentials

## Image optimization
- Use Next.js Image component where applicable
- Responsive sizes, modern formats (avif, webp)

## Code splitting
- 3D scene code isolated in `components/three/`
- Form components separate from page shells
- Use dynamic imports for heavy optional features

## Performance targets
- No stutter on scroll
- No layout shift from animations
- 3D scene: low geometry, minimal lights, dpr [1, 1.5]
- Mobile: reduce blur count, shadow complexity, particle density

## Final check
No visual win counts if the page stutters, content becomes harder to read, or CTAs become less clear.
