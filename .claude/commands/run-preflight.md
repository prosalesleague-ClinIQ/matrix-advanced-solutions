# Run Preflight Checks

Before deploying, verify the following:

## Metadata completeness
- [ ] Every route has title and description
- [ ] OG basics present on key pages
- [ ] No duplicate or missing titles

## Responsiveness
- [ ] All pages render cleanly at 375px, 768px, 1024px, 1440px
- [ ] Cards stack properly on mobile
- [ ] CTAs remain accessible on small screens
- [ ] No horizontal overflow

## Reduced motion
- [ ] Hero fallback renders without 3D
- [ ] Section reveals still visible without animation
- [ ] No motion-only content

## Form behavior
- [ ] All 4 forms validate correctly
- [ ] Success states display clearly
- [ ] Error states preserve form data
- [ ] Honeypot field hidden from real users
- [ ] UTM params captured silently

## Route consistency
- [ ] All nav links resolve
- [ ] Footer links resolve
- [ ] 404 page renders

## CTA naming consistency
- [ ] Event names follow pattern: cta_[action]_[location]
- [ ] Form events follow: form_[name]_submit

## Dark theme integrity
- [ ] All text readable on dark backgrounds
- [ ] Focus states visible
- [ ] No white-background flash

## Accessibility basics
- [ ] Semantic HTML structure
- [ ] Keyboard navigation works
- [ ] Focus visible on interactive elements
- [ ] Alt text on meaningful images
