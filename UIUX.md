# Clone UIUX Principles

This document is the product-design source of truth for Clone.
Every UI change should reference these principles before implementation.

## Product Intent

Clone should feel calm, competent, and fast.
Users should never feel lost when opening the app.
The first minute should be clear without reading docs.

## Core Principles

1. Clarity over density
- Show only what is needed for the current decision.
- Hide advanced controls behind progressive disclosure.

2. Calm-first visual language
- Prefer whitespace, strong typographic hierarchy, and restrained color.
- Use color primarily for status and emphasis, not decoration.

3. One primary action per surface
- Every screen should have one obvious next action.
- Secondary actions should be available but visually quieter.

4. Progressive flow
- Start with system status and recommended action.
- Let users drill down from summary to detail without context switching.

5. Fast perceived performance
- Prioritize instant feedback for clicks and form actions.
- Use optimistic updates where safe and explicit loading states everywhere.

6. Predictable interaction model
- Keep control placement and wording consistent across views.
- Reuse patterns for selection, filtering, confirmation, and error handling.

7. Accessibility by default
- Keyboard navigable flows for all core actions.
- High-contrast states, visible focus, semantic labels, and ARIA where needed.

8. Trust and transparency
- Show what Clone is doing, what changed, and what failed.
- Error messages must include clear recovery action.

## UX Rules For Launcher

1. Never block startup on optional metadata files.
- Local repo discovery must work without `repos.yaml`.

2. Code root is explicit and editable.
- Always show current `Code Root`.
- Refresh actions should operate on that root only.

3. Merge, do not replace, discovery sources.
- Managed catalog + local scan + GitHub should combine into one clear list.
- Show source labels only when helpful, not noisy.

4. Selection should be easy and safe.
- `Select all` and `Select none` should always be available.
- Keep bulk operations reversible before final confirmation.

5. Empty states must guide.
- No dead ends. Every empty state needs the next recommended click.

## Information Architecture

1. Level 1: Situation
- Current system health, latest run, and critical alerts.

2. Level 2: Decision
- Start run, stop/restart/normalize, queue urgent tasks.

3. Level 3: Diagnosis
- Repo insights, run details, logs, and events.

## Visual Direction

Style target: "Lovefrom discipline + Apple clarity"

- Minimal chrome, strong spacing rhythm, and crisp typography.
- Micro-animations should be subtle and purposeful.
- Avoid visual noise, heavy gradients, and novelty effects in operational views.

## Copy Style

- Direct and concrete.
- Actionable labels over abstract labels.
- Prefer "what happened + what to do next" in all alerts/errors.

## Engineering Stack Direction

Target stack for next UI generation:

- Frontend: Next.js 16 (App Router), React 19, TypeScript
- UI system: Tailwind CSS v4, `shadcn/ui`, Radix Primitives
- Data/state: TanStack Query + TanStack Virtual
- Canvas interactions: Konva (`react-konva`)
- Realtime collaboration: Liveblocks
- Backend: Next.js route handlers + worker service for long-running tasks
- Persistence: SQLite

## Delivery Checklist (Per UI Change)

Before merge, confirm:

1. Does the change reduce or increase cognitive load?
2. Is the primary action clearer than before?
3. Are loading, empty, success, and error states explicit?
4. Is keyboard + screen-reader behavior still correct?
5. Can a new user recover without reading docs?
