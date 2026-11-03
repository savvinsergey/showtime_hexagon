---
name: ship
description: Implement an approved OpenSpec change through the project delivery pipeline.
---

## Host adapter
In Codex, resolve the change then execute `.agents/roles/orchestrator.md` in the main agent, launching specialists sequentially. Handle CONTINUE locally and user decisions directly. Launch/relaunch instructions below apply to Cursor.

# Ship

Start implementing an approved OpenSpec change through the subagent pipeline. Running `/ship` IS the approval to start: you do not need to press Build. Usage: `/ship [change-name] [--no-commit]`.

You (the main agent) only prepare and launch `orchestrator`; do not implement anything yourself.

## 1. Resolve the change
- If a change name is given after `/ship`, use it.
- Otherwise run `openspec list --json`. If exactly one active change exists, use it; if several, ask the user which one (list them); if none, tell the user to run `/opsx-propose` first and stop.
- Only check that the directory `openspec/changes/<change-name>/` exists; if not, tell the user to run `/opsx-propose` and stop. Do not validate the artifacts here: the orchestrator checks them (artifact files and `openspec validate`) as its first step.

## 2. Launch the orchestrator
Launch the `orchestrator` subagent (host subagent tool) with a self-contained prompt:
- the change name and path;
- "The user approved this plan by running /ship; start the pipeline now; do not ask for plan approval again";
- `commit: on` (default) or `commit: off` if `--no-commit` was given;
- the user's extra constraints from the conversation, if any;
- "Resume from the first unchecked task if the change was already started (read tasks.md and progress.md)".
Wait for it to finish (do not run it in the background). Its final message starts with `STATUS: <value>`; handle it:
- `ARCHIVE_PENDING`: relay the final report and ask the user whether to archive the change (`/opsx-archive`: merges the delta specs into `openspec/specs/` and moves the change to the archive). If the user confirms, relaunch `orchestrator` with `mode: archive` (same change name and `commit` setting); if the user declines, relaunch with `mode: finish`, or simply finish if only the push reminder is missing. Relay its final `DONE` message (it includes the push/merge request instructions).
- `NEEDS_USER` or `BLOCKED`: pass the question or failure to the user **and wait**. Do not relaunch until they answer. After the answer or the fix, relaunch `orchestrator` with the answer included; it resumes from the saved state.
- `CONTINUE`: it hit a context checkpoint (4 tasks done, more remain). Do not ask the user; show a one-line progress note and relaunch `orchestrator` with the same change name and `commit` setting (it resumes from the saved state). Repeat until another status arrives. If the previous run ended without a `STATUS:` line (an interim progress report), treat it as `CONTINUE` and relaunch with an explicit instruction: finish the current subagent, then keep going until a real `STATUS`.
- `DONE`: relay the report.
- No `STATUS` line, or the orchestrator says it cannot launch subagents (no host subagent tool): read `.agents/roles/orchestrator.md` and execute its pipeline yourself in this chat, launching `architect`, `analyst`, `developer`, `reviewer` and `tester` one at a time, with the same rules.

## Rules
- Never press-through to implementation without an OpenSpec change; small fixes use `/fix`.
- Do not archive the change yourself; archiving happens only after the user confirms, and it is done by relaunching the `orchestrator` with `mode: archive`.
