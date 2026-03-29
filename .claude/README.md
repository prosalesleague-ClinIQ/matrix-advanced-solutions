# Claude Code Workspace — Matrix Advanced Solutions

This workspace provides structured guidance for Claude Code sessions working on the Matrix website.

## Directory structure

```
.claude/
├── CLAUDE.md              # Project-level Claude Code context
├── README.md              # This file
├── skills/                # Domain-specific skill guides
│   ├── design-system/     # Visual identity and component rules
│   ├── nextjs-architecture/ # App structure and patterns
│   ├── 3d-motion/         # Animation and 3D guidance
│   ├── forms-automation/  # Forms, webhooks, and tracking
│   ├── seo-analytics/     # SEO, metadata, and events
│   ├── accessibility-performance/ # A11y and performance
│   └── brand-copy/        # Voice, tone, and compliance
└── commands/              # Page build and review commands
    ├── build-homepage.md
    ├── build-solutions-page.md
    ├── build-catalog-page.md
    ├── build-growth-page.md
    ├── build-onboarding-page.md
    ├── build-contact-page.md
    ├── run-preflight.md
    └── run-conversion-audit.md
```

## How to use

### Skills
Skills provide domain knowledge. Reference them before making changes in their area. They contain rules, not tasks — treat them as guardrails.

### Commands
Commands provide step-by-step guidance for building or reviewing specific pages. They include section order, content rules, and quality checks.

## Recommended MCP integrations
- **Browser/DevTools MCP** — visual testing, Lighthouse audits
- **GitHub MCP** — PR management, issue tracking
- **Filesystem MCP** — advanced file operations
- **CMS MCP** — future content management integration

## Recommended hooks
- Pre-commit: lint + typecheck
- Pre-push: build check
- Post-edit: metadata consistency check

## Optional future subagents
- `visual-polish` — review design consistency and spacing
- `conversion-review` — audit CTA hierarchy and form friction
- `accessibility-review` — check a11y compliance
- `performance-review` — check bundle size and render perf
- `seo-review` — validate metadata and heading structure
