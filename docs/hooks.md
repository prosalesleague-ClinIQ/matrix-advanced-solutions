# Recommended Hooks

Claude Code hooks are shell commands that run in response to events. Configure in `.claude/settings.json`.

## Pre-commit hook
```json
{
  "hooks": {
    "pre-commit": "npm run lint && npm run typecheck"
  }
}
```

Purpose: Catch lint errors and type issues before committing.

## Metadata consistency check
After editing any `page.tsx`, verify metadata exports exist:
- title present
- description present
- no duplicate titles across routes

## Accessibility smoke check
After editing components, verify:
- No `div` used where `button` or `a` is appropriate
- Focus states present on interactive elements
- `aria-label` on icon-only buttons

## Asset naming check
Verify image and icon files follow naming conventions:
- lowercase kebab-case
- descriptive names
- appropriate format (svg for icons, webp/avif for photos)

## Route build validation
After adding or modifying routes, verify:
- Route is listed in navigation data
- Metadata is defined
- Page renders without errors
