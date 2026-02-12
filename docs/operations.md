# Operations Playbook

This loop should not jump straight into coding. Each repo session should run with an explicit planning checkpoint first.
Default parallel execution is `5` repositories per cycle (`PARALLEL_REPOS=5`).

## Session Cadence

1. Clarify the goal.
- Write one sentence for the session goal.
- Define what success looks like for this session.
- Define non-goals to keep scope tight.
- Ensure `PRODUCT_ROADMAP.md` is current before implementation.

2. Run a deliberate brainstorming checkpoint.
- Spend focused time generating many candidate tasks.
- Include feature, bug, refactor, UI/UX, docs, and verification candidates.
- Rank by impact and alignment to the current milestone.
- Keep backlog depth high so the team never runs out of aligned work.

3. Run the product phase checkpoint.
- Ask: "Are we in a good product phase yet?"
- If no, identify best-in-market products in this segment.
- Extract their core features and refresh parity gaps for this repo.
- Keep iterating and delivering parity/differentiator features until the answer is yes.

4. Decide what needs to be done now.
- List 2-10 concrete tasks for this session.
- Prioritize by impact, risk, and effort.
- Record planned tasks before implementation starts.

5. Keep notes while executing.
- Capture decisions, blockers, and task changes in `PROJECT_MEMORY.md`.
- Record exact verification commands and outcomes.
- End the session with remaining backlog notes.
- Ask repeatedly what features are pending and continue iterations until done criteria are met.
- Run anti-drift checks and re-align immediately if work diverges from goals.

## Required Notes Format

Use `PROJECT_MEMORY.md` -> `Session Notes`:
- `YYYY-MM-DDTHH:MM:SSZ | Goal | Success criteria | Non-goals | Planned tasks`

Append additional lines during execution for:
- decisions made
- blockers encountered
- next actions

## Why This Exists

- Keeps work aligned to objective, not random edits.
- Makes progress auditable and resumable across cycles.
- Reduces context loss when the loop switches repositories.
