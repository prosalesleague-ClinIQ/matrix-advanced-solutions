# Optional Future Subagents

Subagents are specialized Claude Code agents that can be invoked for focused review tasks. These are recommendations for future implementation.

## visual-polish
Purpose: Review design consistency, spacing, typography, and visual hierarchy.
Checks:
- Consistent spacing between sections
- Card design alignment with design system
- Typography hierarchy correctness
- Color usage within brand palette
- Hover state consistency

## conversion-review
Purpose: Audit CTA hierarchy, form friction, trust signals, and funnel clarity.
Checks:
- CTA visibility and prominence
- Form length appropriateness
- Trust language presence on conversion surfaces
- Clear next-step communication
- Funnel continuity across pages

## accessibility-review
Purpose: Check a11y compliance across components and pages.
Checks:
- Semantic HTML usage
- Keyboard navigation completeness
- Focus state visibility
- Color contrast ratios
- Reduced motion support
- Screen reader compatibility

## performance-review
Purpose: Check bundle size, render performance, and loading behavior.
Checks:
- 3D scene frame rate
- Code splitting effectiveness
- Image optimization
- Lazy loading implementation
- Mobile performance

## seo-review
Purpose: Validate metadata, heading structure, and internal linking.
Checks:
- Title and description completeness
- Heading hierarchy correctness
- Internal link coverage
- Schema markup validity
- Canonical URL consistency
