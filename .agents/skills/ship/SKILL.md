---
name: ship
description: Implement an approved OpenSpec change through the project delivery pipeline.
---

## Host adapter
In Codex, read `.agents/codex-workflow.md`. The main agent resolves the change, launches an `orchestrator` subagent with `fork_turns: "none"`, and handles the status protocol below. The orchestrator reads its role and launches specialists sequentially. On `CONTINUE`, start a fresh orchestrator from saved files in the same user chat; do not resume the old context or run the task loop in the main agent.

For all Codex launches, use a self-contained handoff without the parent chat history. Each specialist uses `fork_turns: "none"` and a fresh agent for each task/role pair; reuse is only for fixes or interrupted work in that same assignment. Final-run and acceptance each get their own agent. Both dispatcher and orchestrator follow the wait and wake-handling rules in `.agents/codex-workflow.md`.

In Cursor, launch the `orchestrator` subagent and let it launch specialists. It follows the Cursor rules in the orchestrator role: a new subagent per task/role pair, resume only for fixes of that same assignment, a short handoff, and one wait for the report. Do not run the pipeline in this chat while that subagent is available.

# Ship

Start implementing an approved OpenSpec change through the subagent pipeline. Running `/ship` IS the approval to start: you do not need to press Build. Usage: `/ship [change-name] [--no-commit]`.

You (the main agent) only prepare and launch `orchestrator`; do not implement anything yourself.

## 1. Resolve the change
- If a change name is given after `/ship`, use it.
- Otherwise run `openspec list --json`. If exactly one active change exists, use it; if several, ask the user which one (list them); if none, tell the user to run `/opsx-propose` first and stop.
- For an explicitly authorized archive retry, bypass normal active-change discovery. Use the recorded target or locate the unique archived `progress.md` matching the change and work branch. Pass the target and commit setting to `mode: archive`; ambiguous recovery requires a user decision.
- For normal implementation only, check that the directory `openspec/changes/<change-name>/` exists; if not, tell the user to run `/opsx-propose` and stop. Do not validate the artifacts here: the orchestrator checks them (artifact files and `openspec validate`) as its first step.

## 2. Launch the orchestrator
Launch the `orchestrator` subagent (host subagent tool) with a self-contained prompt:
- the change name and path;
- in Codex, paths to `.agents/codex-workflow.md` and `.agents/roles/orchestrator.md`, the work branch if known, and `fork_turns: "none"` on the launch;
- "The user approved this plan by running /ship; start the pipeline now; do not ask for plan approval again";
- `commit: on` (default) or `commit: off` if `--no-commit` was given;
- the user's extra constraints from the conversation, if any;
- "Resume from the first unchecked task if the change was already started (read tasks.md and progress.md)".
Wait for it to finish (do not run it in the background). Its final message starts with `STATUS: <value>`; handle it:
- `ARCHIVE_PENDING`: relay the final report and ask the user whether to archive the change (`/opsx-archive`: merges the delta specs into `openspec/specs/` and moves the change to the archive). If the user confirms, relaunch `orchestrator` with `mode: archive` (same change name and `commit` setting); if the user declines, relaunch with `mode: finish`, or simply finish if only the push reminder is missing. Relay its final `DONE` message (it includes the push/merge request instructions).
- `NEEDS_USER` or `BLOCKED`: pass the question or failure to the user **and wait**. Do not relaunch until they answer. After the answer or the fix, relaunch `orchestrator` with the answer included; it resumes from the saved state.
- `CONTINUE`: it hit a context checkpoint (4 tasks done, more remain). Do not ask the user; show a one-line progress note and launch a fresh `orchestrator` with the same change name and `commit` setting (it resumes from saved files). In Codex use `fork_turns: "none"`, not `followup_task` on the old orchestrator. Repeat until another status arrives.
- `DONE`: relay the report.
- In Codex, an interrupted run without a final `STATUS` is not a completed checkpoint: first ensure the old run and any active specialist have stopped or completed before resuming it. Never start overlapping orchestrators. If the host cannot launch the orchestrator or its specialists, report the limitation and wait; do not silently run the pipeline in the main chat.
- In Cursor, if no `STATUS` line is returned, continue the current subagent until a real status. If the host has no subagent tool, read `.agents/roles/orchestrator.md` and execute its pipeline in this chat with the same stage rules.

## Rules
- Never press-through to implementation without an OpenSpec change; small fixes use `/fix`.
- Do not archive the change yourself; archiving happens only after the user confirms, and it is done by relaunching the `orchestrator` with `mode: archive`.
