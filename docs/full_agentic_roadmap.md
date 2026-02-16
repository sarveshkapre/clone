# Full Agentic Roadmap

Goal: make Clone a high-agency, continuous full-stack operator for many GitHub repos, while still being safe, inspectable, and steerable from chat/UI.

## Current Gaps

- Task intake was not first-class: requests had to be embedded in prompts/docs, not a live queue.
- No explicit done/blocked contract for externally injected tasks.
- Operator interaction loop was weak: adding work while a run was active was not streamlined.
- Autonomy quality varied by repo because execution memory/queue discipline was inconsistent.
- Governance was mostly prompt-based; hard runtime gates were limited.

## Implemented Now

- Live operator task queue (`logs/task_queue.json`) consumed by `scripts/run_clone_loop.sh`.
- Per-repo queue claim/dispatch at pass start (`QUEUED -> CLAIMED`).
- Prompt contract for queue outcomes with strict markers:
  - `QUEUE_TASK_DONE:<id>`
  - `QUEUE_TASK_BLOCKED:<id>`
- Automatic finalize step:
  - done markers -> `DONE`
  - blocked markers -> `BLOCKED`
  - missing markers -> auto requeue for later pass
- Stale claim recovery with TTL (`TASK_QUEUE_CLAIM_TTL_MINUTES`).
- CLI enqueue helper: `scripts/add_task_queue.sh`.
- Control Plane queue UX:
  - add tasks while run is active
  - filter queue by repo/status
  - quick status actions (done/block/cancel/requeue)
- Intent intake pipeline:
  - `intents.yaml` queue for project-level intents
  - local repo detection under `CODE_ROOT` before scaffolding
  - automatic scaffold + git init + bootstrap commit when missing
  - optional GitHub repo create/sync + push
  - auto enrollment into managed repos catalog (`repos.runtime.yaml` by default)
- Periodic security audit pattern:
  - commit/cycle-triggered lightweight security scan
  - report artifact per pass
  - auto-remediation attempt for high/critical findings
- Optional SQLite durability layer:
  - persistent run/queue/intent/security snapshots
  - better crash recovery visibility and queryable audit trail

## Target Architecture (Next)

1) Queue intelligence:
- Add dependencies (`depends_on`) and deadline/SLA fields.
- Add retry policy per task (`max_retries`, backoff).
- Add repo-capability tags (frontend/backend/infra/data) to improve dispatch quality.

2) Stronger completion proof:
- Require queue tasks to include evidence markers:
  - changed files
  - verification commands
  - commit hash
- Auto-fail completion marker without verification evidence.

3) Multi-agent orchestration:
- Planner agent proposes plan graph per queue batch.
- Specialist agents execute by domain (UI, backend, infra, tests).
- Supervisor agent arbitrates conflicts and release gating.

4) Human steering without stopping runs:
- Chat-originated tasks auto-append to queue (same schema as UI/CLI).
- Priority bump + preemption rules for urgent items.
- “Run next on repo X” pinning in control plane.

5) Robust governance:
- Approval policy tiers (`safe`, `assertive`, `risky`).
- Hard safeguards for destructive actions and external side effects.
- Deterministic audit log for every queue transition and action.

## UI/UX Upgrades For Clone UI

- Add a single “Operator Inbox” surface at top of Controls:
  - compose, priority, SLA, assignee policy
  - immediate queue health indicator (age, blocked ratio, stale claims)
- Add run-level “Now / Next / Blocked” strip tied to queue state.
- Add repo drilldown tab: queue tasks + evidence + last action timeline.
- Add interruption-resume UX for long tasks (pause/resume/reassign).
- Add quality gates dashboard (tests, UIUX checklist, CI, incident trend).

## Market Patterns To Borrow

- Durable execution + resumability from LangGraph:
  - [Durable execution docs](https://docs.langchain.com/oss/python/langgraph/durable-execution)
  - [Interrupts for human-in-the-loop](https://docs.langchain.com/oss/python/langgraph/interrupts)
- Built-in agent primitives and tracing from OpenAI:
  - [New tools for building agents](https://openai.com/index/new-tools-for-building-agents/)
  - [Introducing AgentKit](https://openai.com/index/introducing-agentkit/)
- Specialized subagents from Anthropic:
  - [Subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- Safety constraints for high-agency computer actions:
  - [Computer use guidance](https://docs.anthropic.com/en/docs/build-with-claude/computer-use)
- Layered message-driven orchestration from AutoGen:
  - [AutoGen architecture](https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/core-concepts/architecture.html)

## 30-60-90 Plan

30 days:
- enforce evidence-backed completion markers
- queue dashboards (age, retries, blocked)
- chat-to-queue bridge

60 days:
- planner/specialist/supervisor split
- policy tiers and approvals
- richer preemption and SLA scheduling

90 days:
- reliability SLOs for autonomy loop
- regression/eval harness for autonomous behavior quality
- release train with staged deploy gates
