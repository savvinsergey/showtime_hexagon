# Codex workflow

Read this when running the delivery pipeline in Codex. It describes the Codex host path. Detailed stage rules stay in `.agents/roles/orchestrator.md`. Role bodies are in `.agents/roles/`. Project rules are in `AGENTS.md`; they win over `.agents/rules/engineering-conventions.md`.

When this file disagrees with a host-specific instruction in `.agents/skills/ship/SKILL.md` or `.agents/roles/orchestrator.md`, follow this file. Codex uses the same `STATUS` relay and `CONTINUE` checkpoints as the shared ship pipeline, with the context and waiting rules below.

## Who does what

The main Codex agent is the dispatcher. It resolves the change and launches one `orchestrator` subagent with `fork_turns: "none"`. It relays statuses, presents questions and archive decisions to the user, and launches the next orchestrator when needed. It does not run the task loop or launch specialists alongside the orchestrator. No new user chat is required.

The orchestrator reads this file and `.agents/roles/orchestrator.md`, runs precheck, and launches `architect`, `analyst`, `developer`, `reviewer` and `tester` one at a time. Specialists do not launch other agents. Only the orchestrator runs the pipeline's git writes; it does not write production code, tests, specs or ADRs. It may edit only the checkboxes in `tasks.md` and `progress.md` of the change. The delegation tree is dispatcher -> orchestrator -> specialist; never add another orchestrator below it.

The sole spec-editing exception is explicitly confirmed `mode: archive`: the orchestrator may sync delta specs and move the change using the archive skill. It must not change requirements during implementation.

Planning stays in the main chat via `$opsx-propose` (or an explicit request to propose). Implementation starts only when the user runs `$ship` or explicitly asks to ship. `$ship` is the approval. Small fixes without an OpenSpec change use `$fix`, not this pipeline.

## Pipeline

```
$opsx-propose -> user reviews -> $ship <change>
      v
[0 PRECHECK] artifacts, openspec validate, branch, resume point
      v
[1 ARCHITECTURE] architect, only if the change is large or adds a layer, library or port
      v
[2 PREP] analyst in prep mode, only if tasks lack ST-NNNN ids, are too coarse, or miss scenarios
      v
[3 TASK LOOP] each unchecked task, in dependency order:
      developer -> reviewer -> tester -> tick tasks.md -> commit
      small task: developer -> tester in review+test mode -> tick -> commit
      v
[4 FINAL RUN] tester in final-run mode, when stage 4 of the shared role applies
      v
[5 ACCEPTANCE] analyst once, for the whole change
      v
[6 DONE] report, ask the user about archive, then archive or finish
```

A single task affecting builds, configuration or public API also requires stage 4. Stage 5 still runs. Never skip review, tests or final acceptance. Never run stages in parallel.

After four tasks completed in one orchestrator run, if unchecked tasks remain, finish the current task through review, tests and its commit (unless `commit: off`). Save the checkpoint in `progress.md`: work branch, unchanged start commit, commit setting, completed stages, selected ADR paths, next task, relevant user decisions and unresolved findings/cycle counts. Keep checkboxes and scenario evidence current. Do not stop mid-task merely to reach the checkpoint. With `commit: off`, preserve and describe the uncommitted files instead.

The orchestrator then ends with `STATUS: CONTINUE` and a compact handoff. It must not begin the next task or relaunch itself. The dispatcher automatically starts a **new** orchestrator with `fork_turns: "none"`, not `followup_task` on the old one. Pass the change/path, branch, commit setting, instruction paths and applicable user constraints; restore task/stage state from `tasks.md`, `progress.md` and the working tree. Do not paste prior chat history or full reports. Count four tasks afresh in each run; do not rerun completed architecture/prep stages or reset the start commit/cycle counts.

Other statuses follow the shared ship protocol: `NEEDS_USER` or `BLOCKED` is relayed to the user and work waits for their answer; `ARCHIVE_PENDING` requires explicit archive confirmation; `DONE` is the final report. Relaunch with the answer or the authorized archive/finish mode in a fresh orchestrator. Only a genuinely interrupted, unfinished run may resume the same orchestrator; a completed checkpoint always gets a new one. If the host cannot launch an orchestrator or its specialists, report the limitation instead of silently moving the pipeline into the main chat.

Dispatcher and orchestrator both use `wait_agent` with the longest timeout consistent with host instructions and user communication requirements. Each wake can have a different cause. Apply the status protocol when the orchestrator returns its final `STATUS`. Handle user instructions, decisions, errors and permission requests promptly. After a timeout or a message requiring no action, resume waiting. Do not inspect git, files or agent lists solely to check activity.

## Specialists

Start each specialist with `fork_turns: "none"`. Pass the handoff below and the path to its role file (`.agents/roles/<role>.md`). Do not pass or paste the chat history.

Use a fresh agent for each `(task ID, role)` pair. Architecture, prep, final-run and whole-change acceptance are their own assignments, even when the role name repeats. Use `followup_task` only for fixes or interrupted work on that same assignment. The next task gets a new agent. If an agent cannot be resumed, start a fresh one and pass the saved state and the current diff. Preserve partial work.

Apply the shared waiting rule above to specialist assignments. Handle the report on completion. Do not interrupt it because it is quiet. Interrupt only to cancel, to correct the scope, or when there is concrete evidence that intervention is needed. A permission request goes through the host approval flow; waiting longer does not resolve it.

The orchestrator sends the dispatcher only a final status, a request for a decision or a material problem. Record specialist results in the change’s `progress.md`. The dispatcher provides user updates as required by the host.

## Handoff

Each assignment gets a compact prompt:

- Change name and path, task ID and exact task text, stage and mode, role file path.
- Work branch. Stay on it. Do not switch branches, commit, stash, reset or push.
- Files the specialist may change, and a reminder that other work in the tree must be preserved.
- Scenarios, plus paths to the spec, `design.md` and the selected ADRs. Paths to `AGENTS.md` and `.agents/rules/engineering-conventions.md`.
- User constraints and the previous stage's compact result: files, checks, approval or the exact findings.
- Expected report: about 30 lines, no full logs and no pasted diffs. Failures: failing items and the first relevant error lines.

Pass paths and facts, not copies of whole artifacts.

## Task loop, in short

A small task is one Nx project, at most about 100 changed lines, no generator, no new library, and no new or changed public API, port, route, configuration or breaking change. It skips the separate reviewer: `tester` runs once in `mode: review+test`. Anything else, including scaffolding and workspace-root tooling, gets a full review. When in doubt, review.

Critical review findings and test failures go back to `developer`, then through review and tests again. Warnings do not block. Limit fix cycles for one task to 3, then stop and ask the user. The same limit applies to the final run and to acceptance.

After green tests persist the pending record before ticking, then commit. Reconcile it on the verified work branch regardless of checkbox state, as described in the shared role. `commit: off` only records verification and ticks the task.

With `commit: off`, final-run and acceptance inspect tracked working-tree changes and untracked task files, not only `<start>..HEAD`. The final report lists uncommitted work and does not imply it is ready to push.

## Git

Work branch is `change/<change-name>`, unless the user already prepared another feature branch and the change branch does not exist. Then stay on the current branch. Never stash, reset, discard, push, amend, rebase or pass `--no-verify`.

`commit: off` skips every git write. Otherwise: one commit per finished task, one per fix after a final-run failure or a rejected acceptance, and one after a confirmed archive. Follow the shared role’s staged-index safeguards and include named architect/prep outputs in the first task commit. Never `git add -A`. Before committing, snapshot unrelated unstaged work and restore it if the hook touches it.

Commit messages follow `commitlint.config.js`. Type `test` is rejected; use `chore` for test-only commits. Header, body and footer lines are at most 100 characters. The body includes `ST-NNNN <task title>` and `Change: <change-name>`.

## Archive

After acceptance, show the final report and ask whether to archive. Archive only after an explicit yes, using `.agents/skills/openspec-archive-change/SKILL.md`. Use the recorded archive target for retries. In commit mode, commit the archive and stay on the work branch. Tell the user the branch name, that commits are local, and that they push and open the merge request themselves.

## Where the rest lives

When evaluating token usage, measure after the run from available host telemetry. Report empty wait timeouts, model calls, input tokens and cached input per completed task, separately for the dispatcher, all orchestrator runs combined and specialists. Include the whole-run total, count cached input as part of input, and compare changes of similar scope. Mark missing counters as unavailable. Keep measurement outside the wait loop.

- Stage-by-stage rules and commit examples: `.agents/roles/orchestrator.md`
- Specialist behavior: `.agents/roles/architect.md`, `analyst.md`, `developer.md`, `reviewer.md`, `tester.md`
- Ship entry: `.agents/skills/ship/SKILL.md`
- Propose, update, archive: `.agents/skills/openspec-propose/SKILL.md`, `openspec-update-change/SKILL.md`, `openspec-archive-change/SKILL.md`
