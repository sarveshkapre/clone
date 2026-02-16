- UI/UX quality target: calm, elegant, and high-signal. Avoid busy interfaces, noisy decoration, or dense walls of controls.
- Keep interaction minimal: the primary user goal should be visible and actionable within the first viewport.
- Prefer strong visual hierarchy: clear heading scale, readable body text, deliberate spacing rhythm, and consistent component sizing.
- Use design tokens for color, spacing, radius, shadow, and typography so updates are systematic and reversible.
- Preserve consistency: one interaction pattern per intent (navigation, confirm, edit, delete, compare, filter).
- Accessibility is required: semantic structure, keyboard navigation, focus visibility, contrast-safe colors, and descriptive labels.
- Motion should be subtle and meaningful; avoid distracting animations.

Frontend stack guidance:
- For Next.js/React repos, default to Tailwind CSS + shadcn/ui patterns unless a mature existing design system should be preserved.
- Reuse and extend component primitives before introducing custom one-off components.
- Keep style composition clean; avoid long unstructured class strings when components can encode variants.

Delivery workflow for UI work:
- Before coding, state the UX objective, success criteria, and non-goals for the touched flow.
- Build/adjust the smallest cohesive slice first; avoid broad redesigns in a single pass.
- Run a UI polish pass after functional work: spacing, typography, empty/loading/error states, and copy clarity.
- Validate changed screens for desktop and mobile breakpoints.
- Validate interaction quality: no dead ends, no hidden critical actions, and no ambiguous labels.
- Record UI decisions and verification evidence in PROJECT_MEMORY.md.
- Add a session marker line in PROJECT_MEMORY.md with strict same-line fields:
  UIUX_CHECKLIST: PASS|BLOCKED | flow=<value> | desktop=<value> | mobile=<value> | a11y=<value> | risk=<value>
