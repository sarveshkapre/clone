# README Policy (Keep It Short)

`README.md` is the entrypoint for humans. It should stay short, skimmable, and stable.

## What README.md Should Contain

- What this repo does (1-2 sentences).
- How to run it locally (copy/paste quickstart).
- How to run it headless / “deploy” it (1-2 options).
- High-level features (small bullet list).
- Where to find deeper docs (links).

## What README.md Should NOT Become

- A dumping ground for long troubleshooting transcripts.
- A place for giant one-off commands (put them in `docs/`).
- A full architecture spec (put it in `docs/architecture.md`).

## Where To Put Everything Else

- `docs/observability.md`: commands, telemetry, commit tables, log tailing, run/stop.
- `docs/architecture.md`: design, invariants, data flow, failure modes.
- `docs/security.md`: prompt-injection defenses, scopes, secrets handling, trust model.
- `docs/operations.md`: recommended run strategy, prioritization rules, governance.

## Agent Behavior Rule

When updating docs:

- Keep `README.md` concise; prefer updating/adding files under `docs/`.
- If `README.md` needs changes, update only the smallest relevant section and link to `docs/`.

