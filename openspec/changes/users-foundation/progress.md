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

## Tasks
