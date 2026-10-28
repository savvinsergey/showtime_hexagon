# Progress: users-foundation

- start commit: 1b5a8d44e83fdbf492c270ef445ec66745a4da38
- work branch: change/users-foundation
- note: working tree had ~50 pre-existing uncommitted/untracked files (tooling, rules, openspec artifacts, layout/spartan edits). Commits stage only task files.
- precheck: artifacts present, `openspec validate users-foundation --strict` valid; size: large + structural (two new libraries) -> architect ran.
- ADRs (final list): docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md, docs/adr/0002-framework-free-shared-kernel.md
- design addition: ST-0003 must also add `eslint.conventions.mjs` and `eslint.depconstraints.mjs` to `@nx/eslint:lint` inputs in `nx.json` (lint cache invalidation); verify with `npx nx show project layout --json` + one lint run with `--skip-nx-cache`.

## Stages
- stage 0 PRECHECK: done
- stage 1 ARCHITECTURE: done (architect: design.md refined, ADR-0001, ADR-0002)
- stage 2 PREP: skipped (ST-NNNN IDs present, scenarios covered, tasks small enough)

- commit 9a93af8: plan artifacts + ADRs (docs(openspec))

## Tasks
- ST-0001: done. Developer 2 runs (+ lint fix: scoped override of `@nx/enforce-module-boundaries` for `**/spartan-ui/src/index.ts` only, orchestrator decision because the 63 `@spartan-ng/helm/*` re-exports became same-project imports once sub-libs are hidden). Review: Approve (1 iteration). Tester: scenario satisfied, no test file warranted (config only).
  Scenario coverage: workspace-boundaries/Existing projects are tagged -> `nx show projects` (4 projects) + tags in `nx show project --json` + lint green (shell, layout, shared-spartan-ui) + shared-styles:stylelint green.
  Review warnings (non-blocking): (1) the barrel override disables boundaries for the whole barrel; narrower alternative `allow: ['^@spartan-ng/helm/']`; (2) design.md line ~7 still says "Only `shared-styles` has tags" (stale).
  Note for ST-0014: `nx run shell:test` fails today with "No tests found" (no spec files in apps/libs; pre-existing). `layout` has no test target. May need `passWithNoTests` in shell's test target at ST-0014.
- DECISION (user, Variant A): `.nxignore` -> `libs/shared/spartan-ui/*/` + `!libs/shared/spartan-ui/src/`; remove `libs/shared/styles/`. Nx sees shell, layout, shared-spartan-ui, shared-styles; 64 helm sub-libs stay hidden. `check-tags` (ST-0002) skips .nxignore-ignored project.json. design.md + ADR-0001 updated by architect; ST-0001/ST-0002 wording updated by analyst.
