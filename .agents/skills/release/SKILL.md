---
name: release
description: Preview and perform version releases when explicitly requested, confirming proposed versions first.
---

# Release

Release versioned projects with semver via `nx release` (independent versions per project, conventional commits, git tags `<project>@<version>`, per-project `CHANGELOG.md`). Usage: `/release [project ...]` (default: all projects in `release.projects` of `nx.json`).

You (the main agent) run this yourself; do not use the pipeline subagents. Never push and never publish to a registry.

## 1. Preconditions
- `git status` must be clean (no uncommitted changes) and the current branch should be the release branch (usually `main`). If not, tell the user what is wrong and stop (do not stash or discard anything).
- Make sure lint, tests and build are green for the affected projects: `npx nx affected -t lint test build` (check `--help` before using flags). If anything fails, stop and report.
- Run nx through `npx nx ...`.

## 2. Preview (always first)
Run `npx nx release --dry-run` (add `--projects=<names>` if the user named projects). If a project has no release tag yet, nx asks for `--first-release`; add it only for projects without a previous `<project>@<version>` tag.
Show the user, per project: current version -> next version, the bump reason (feat/fix/breaking), and the changelog entry. Projects without relevant commits are not released.
Check that breaking changes are really marked (`!` / `BREAKING CHANGE:`) and that no `feat`/`fix` commit is mislabeled.

## 3. Confirm
Ask the user for explicit confirmation of the proposed versions. Do nothing else until they confirm. They may override a version with `--specifier`. Note: `adjustSemverBumpsForZeroMajorVersion` is `false`, so a breaking change in a `0.x` project bumps the major version (for example `0.3.1` -> `1.0.0`), `feat` bumps minor and `fix`/`perf` bump patch; call this out in the preview when a project would jump to `1.0.0`.

## 4. Release
After confirmation run `npx nx release --skip-publish` (with the same project/first-release flags). It bumps `package.json` versions, writes `CHANGELOG.md` per project, creates one commit and one tag per released project (`<project>@<version>`). The commit message contains the versions: `chore(release): publish <project> <version>` when one project is released, or `chore(release): publish` with a body line `- project: <name> <version>` per project when several are released. It does not push.
Then show `git log -1 --stat` and `git tag --points-at HEAD`.

## 5. Finish
Tell the user the next step: `git push --follow-tags` (do not run it unless they ask).

## Rules
- Never run the real release without the dry-run preview and the user's confirmation.
- Never edit versions, tags or changelogs by hand.
- Spartan-ui libraries are not versioned; to version a new project, add it to `release.projects` and give it a `package.json` (`private: true`, `version: 0.0.0`) first.
