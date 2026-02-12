# Product Phase Rubric

Use this rubric in every repo session.

## Mandatory Question

Ask every session:
- Are we in a good product phase yet?
- Did we spend enough brainstorming time and stay aligned to roadmap goals?

If the answer is no:
- benchmark best-in-market products in the category
- list their core features
- map this repo as missing/weak/parity/differentiator
- implement the highest-value missing parity features now

## Good Product Phase Criteria

Treat a repo as "good product phase" only when most core criteria are true:
- Core user workflows are complete and reliable.
- Critical quality gaps (crashes, broken flows, failing core tests) are controlled.
- Feature set reaches practical parity for primary use cases.
- UX is coherent enough for repeated real usage.
- Verification is repeatable (tests/smoke checks/docs aligned).

## Session Note Template

Record in `PROJECT_MEMORY.md`:
- `YYYY-MM-DDTHH:MM:SSZ | Product phase check | yes/no | Why | Top market products | Parity gaps | Tasks selected`

Also update `PRODUCT_ROADMAP.md` each session:
- pending features
- delivered features
- current milestone
- next cycle priorities

## Guardrails

- Adapt patterns, not proprietary code/assets/content.
- Prioritize repo fit and safety over blind feature copying.
- If parity conflicts with architecture/security constraints, log the tradeoff and pick the next highest-value safe feature.
