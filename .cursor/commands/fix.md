# Fix

Make a small fix or tweak WITHOUT an OpenSpec change. Describe the fix after `/fix` (a bug, a small change, a UI tweak, a refactor of one spot). Usage: `/fix <description> [--no-commit]`.

You (the main agent) run the chain below by launching the subagents yourself, one at a time, with the Task tool. Do not use `orchestrator`, `architect` or `analyst`; there is no OpenSpec change here.

## 0. Scope check (do this first)
Read the request and quickly look at the affected code. Stop and tell the user to use `/opsx-propose` instead if any of these is true:
- it changes behavior described in `openspec/specs/` or adds new user-visible behavior/requirements;
- it touches several layers or libraries, or needs a new layer, library, port or adapter;
- it is clearly large (roughly more than ~150 changed lines or more than a few files);
- the request is ambiguous and the fix cannot be defined in a few sentences (ask a clarifying question instead of guessing).

## 0.5 Branch (unless `--no-commit`)
Same principles as `/ship`: check `git branch --show-current` and `git status`.
- If the branch is `main`, `master` or `develop`, create and switch to `fix/<short-slug>` (kebab-case slug from the description, at most ~40 characters, e.g. `fix/sidebar-active-link`). Otherwise stay on the current branch (for example you are already on a `fix/*` or `change/*` branch).
- Tell every subagent you launch the work branch: `current branch: <name>; stay on it, do not switch branches, do not commit, stash, reset or push`.
- If the working tree has unrelated uncommitted changes, never include them in the commit (stage specific files only) and mention it in the summary.
- Never push.

## 1. developer
Launch `developer` with a self-contained prompt: the fix description, the relevant files/symbols you found, and the note "no OpenSpec change: work from this description; follow `.cursor/rules/engineering-conventions.mdc` and `.cursorrules`; smallest correct change; run `npx nx lint` and `npx nx test` for the affected project (build only if routes, lazy loading or build config are touched)". Require a compact report: summary, changed files, command results (counts and failures only), proposed commit message.

## 2. reviewer
Launch `reviewer` with: the fix description, the developer's summary and changed files (it reads `git diff`), and the developer's command results (do not re-run lint/test), and the note "no OpenSpec change: review code quality only".
- Critical issues: send the findings verbatim to `developer` (fix only those), then re-launch `reviewer`. Repeat at most 2 times; if still unresolved, stop and report to the user.
- No Critical issues: continue. Mention Warnings/Suggestions to the user in the final summary.

## 3. tester (only when behavior changed)
Launch `tester` (write mode) only if the fix changes observable behavior or fixes a bug (add a regression test). Skip it for purely cosmetic, copy, config or style-only changes, and say that you skipped it.
Prompt: the fix description, changed files, the note "no OpenSpec change: derive tests from the fix description; add a regression test for the bug". If the tester reports a production bug or failing test, send the findings to `developer`, then `reviewer`, then `tester` again (at most 2 cycles).

## 4. Commit (unless `--no-commit`)
Git write commands (`git switch -c`, `git add`, `git commit`) may need the `git_write` permission in the sandbox. After review (and tests, if run) are clean, make ONE commit:
- Stage only the specific files changed by the fix (source and tests, from the developer's and tester's reports); never `git add -A` / `git add .`.
- Use the proposed commit message from the developer's latest report as the basis and correct it where it breaks the rules below.
- Message must satisfy `commitlint.config.js`: `<type>(<scope>): <subject>` with type in `feat, fix, refactor, perf, docs, style, build, ci, chore, revert` (this repo **rejects** type `test`; use `chore` for test-only commits). Use `fix` for bugs, otherwise the closest type. Scope = affected Nx project name, subject lowercase, no trailing period, header at most 100 characters. Body and footer lines at most 100 characters each. Body: one or two lines describing the fix. Use `fix` only for real bug fixes visible to users (they become patch releases via `nx release`); use `refactor`/`style`/`chore` otherwise. If the fix breaks a public API, selector, config or route, stop and tell the user to use `/opsx-propose` instead.
- Never push, amend, rebase, force, or use `--no-verify`. If a commit hook fails, send its output to `developer` to fix, then retry once; if it still fails, stop and report.

## 5. Finish
Give the user a short summary:
- what was fixed and why;
- changed files and tests added (or "tests skipped: reason");
- lint/test/build results;
- the branch name (it stays checked out) and commit hash (or "not committed: --no-commit"), with a note that the commit is local and the user pushes it and opens the merge request themselves;
- non-blocking review Warnings/Suggestions, if any.

## Rules
- Subagents do not share your context: every prompt must be self-contained.
- Never run stages in parallel.
- Never create OpenSpec files for a `/fix`.
