# Product Delivery Loop

Use this loop for each product until definition-of-done is met.

## Parallelism

- Work on `5` repos in parallel per cycle by default (`PARALLEL_REPOS=5`).
- Keep each repo aligned to a shared product roadmap.
- Do not impose a hard commit limit; commit count is driven by missing product work.

## Loop

1. Create a detailed roadmap and stick to goals.
2. Brainstorm broadly and rank candidates before coding.
3. Document the plan and current milestone.
4. Start implementing features.
5. Iterate on implementation.
6. Finish all selected cycle features before advancing to the next loop stage.
7. If any selected feature is blocked, record reason/evidence and continue remaining selected features.
8. Fix bugs and regressions.
9. Refactor code.
10. Continue feature development.
11. Ask what features are still pending.
12. Improve UI/UX quality.
13. Update documentation.
14. Refactor again where needed.
15. Verify product behavior end-to-end.
16. Identify missing features.
17. Replenish backlog so there is always aligned work queued.
18. Repeat until done criteria are satisfied.

## Required Artifacts

- `PRODUCT_ROADMAP.md`: milestones, pending features, delivered features, done criteria.
- `PROJECT_MEMORY.md`: session notes, decisions, verification evidence.
- `CLONE_FEATURES.md`: task backlog and delivered items.

## Done Criteria

A product is done only when all are true:
- Core workflows are complete and reliable.
- No open critical defects.
- UI/UX is polished for repeated usage.
- Verification commands are stable and passing.
- Documentation reflects real behavior.
