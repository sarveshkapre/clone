# Clone Orchestrator

This project runs Codex in an autonomous loop across active repositories in `/Users/sarvesh/code`.

Goal:
- operate Codex in a mostly hands-off mode
- keep repositories updated and improving
- prioritize high-impact work while preserving safety and reliability
- fix CI failures automatically after pushes when possible

## What It Does

- Discovers recently active repos and builds `repos.yaml`.
- Runs maintenance/product-improvement passes per repo.
- Uses steering prompts + a core directive for decision quality.
- Tracks per-repo work memory in `CLONE_FEATURES.md`.
- Runs local verification (lint/tests/build and smoke paths like API/CLI checks when feasible) and records evidence in pass output.
- Pushes directly to `main`.
- Watches GitHub Actions for pushed commits and attempts CI remediation.
- Logs run, event, status, and per-pass details under `logs/`.

## Main Files

- `scripts/discover_active_repos.sh`
- `scripts/run_clone_loop.sh`
- `repos.yaml`
- `prompts/repo_steering.md`
- `prompts/autonomous_core_prompt.md`

## How To Run

1) Refresh active repo list:

```bash
cd /Users/sarvesh/code/Clone
/Users/sarvesh/code/Clone/scripts/discover_active_repos.sh /Users/sarvesh/code
```

2) Start autonomous loop (example):

```bash
cd /Users/sarvesh/code/Clone
MODEL=gpt-5.3-codex PARALLEL_REPOS=3 TASKS_PER_REPO=10 MAX_HOURS=12 MAX_CYCLES=9999 /Users/sarvesh/code/Clone/scripts/run_clone_loop.sh
```

3) Monitor:

```bash
tail -f /Users/sarvesh/code/Clone/logs/run-<RUN_ID>.log
tail -f /Users/sarvesh/code/Clone/logs/run-<RUN_ID>-events.log
cat /Users/sarvesh/code/Clone/logs/run-<RUN_ID>-status.txt
```

## Key Runtime Knobs

- `PARALLEL_REPOS`: concurrent repos (default `3`)
- `TASKS_PER_REPO`: planned tasks per repo session (default `10`)
- `MAX_CYCLES`: number of full passes across all repos (`1 cycle = 1 touch per repo`)
- `MAX_HOURS`: total runtime cap
- `CI_AUTOFIX_ENABLED`: `1` to auto-remediate failing GitHub Actions
- `PROMPTS_FILE` / `CORE_PROMPT_FILE`: steering and core autonomous prompts

## Safety Notes

- This loop uses direct pushes to `main`.
- It runs Codex with `--dangerously-bypass-approvals-and-sandbox`.
- Use a dedicated bot account/tokens and enforce repository guardrails for production use.
