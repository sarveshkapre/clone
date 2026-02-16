# UI/UX Playbook

Use this playbook in every repo session that touches user-facing surfaces.

## Quality Bar

- Target clean, calm, premium interfaces.
- Prioritize clarity over novelty.
- Keep the user focused on one primary task per view.

## Principles

- Define one UX objective per session and keep scope tight.
- Build around reusable primitives, not one-off screens.
- Apply clear hierarchy: typography, spacing, and contrast must guide attention.
- Keep copy short and explicit; remove vague labels.
- Treat loading, empty, and error states as first-class UX.
- Keep keyboard and accessibility behavior reliable by default.

## Preferred Stack

- For Next.js/React repos: default to Tailwind CSS and shadcn/ui unless the repo already has a stronger design system.
- Extend existing components and variants before adding new custom widgets.
- Keep tokens centralized (spacing, colors, radius, shadow, type scale).

## Anti-Overwhelm Checklist

- Is the primary action obvious without scrolling?
- Are there fewer than 1-2 competing visual focal points per viewport?
- Are destructive actions clearly separated from primary actions?
- Are labels concrete and user-language, not implementation-language?
- Is there enough spacing to avoid dense clusters of controls?

## Session Workflow

1) Write UX objective, success criteria, and non-goals in `PROJECT_MEMORY.md`.
2) Implement the smallest coherent UI slice.
3) Run a polish pass for touched views.
4) Validate desktop and mobile breakpoints.
5) Record verification evidence and remaining UX gaps.
6) Add one session marker line in `PROJECT_MEMORY.md` with strict same-line fields:
   `UIUX_CHECKLIST: PASS|BLOCKED | flow=<value> | desktop=<value> | mobile=<value> | a11y=<value> | risk=<value>`
