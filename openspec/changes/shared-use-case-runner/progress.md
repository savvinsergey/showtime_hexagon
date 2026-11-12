# Progress

- work branch: change/users-domain-application
- start commit: 865afe7c605b98be074027c6b4941755c391448a
- commit: on
- precheck: openspec validate shared-use-case-runner passed; index empty; existing feature branch reused.
- user constraints: no archive, push or release; preserve unrelated pending workflow/roles/skills/AGENTS/.gitignore/docs/earlier journals. Mixed documentation remains uncommitted when necessary; never partially stage mixed files.
- baseline: Users facade has pre-existing formatting edits; preserve while implementing ST-0002.
- architecture: pending (two-library change plus root boundary configuration).
- prep: IDs and scenario mapping present; no prep needed unless architecture identifies a concrete gap.
- cycles: ST-0001 0; ST-0002 0; final-run 0; acceptance 0.

## Architecture / task start
- Architecture complete: refined design.md, no new ADR/library/port; no scope conflict.
- selected ADRs: docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md; docs/adr/0002-framework-free-shared-kernel.md; docs/adr/0003-users-model-and-application-ports.md. Design Decisions links all three.
- Graph verified: kernel has no workspace dependencies. Narrow ADR-0002/0003 and conventions alignment assigned to ST-0001.
- prep: skipped; two ordered ST IDs with full scenario mapping.
- ST-0001: in progress; developer stage; review/test cycles 0.

## ST-0001 verified / pending commit
- reviewer: Approve; no Critical. Warning: protected conventions utils/pathed exception wording remains incomplete after native approval aborted. No retry/bypass.
- tester: full scenario coverage; no edits needed.
- checks: uncached kernel lint/test 44; domain lint/test 74; strict kernel spec tsc; boundary/tag 159; check-tags 8/63 PASS. Nx built-in fallback completed; no active sessions.
- coverage: run-use-case.spec.ts named scenarios original Result, typed errors, concurrent independence, success hook ordering, failure skips hook, execution sync throw/rejection and hook throw. kernel-entry.spec.ts actual direct/renamed/type/value/intermediary rejection matrix, pure controls, sibling utils/RxJS restrictions; graph kernel dependencies empty.
- excluded mixed docs: engineering-conventions.md (protected alignment incomplete) and users-domain-application/design.md (narrow alignment completed, unrelated pending hunks retained).

- ST-0001 commit: ba48bfa0e94cee8b3bb92e9a7393497179262146; hooks passed, helper/spec formatting only. Hook reformatted unrelated Users facade; restored exact pre-hook bytes from snapshot and verified all unrelated paths. Commitlint footer warning nonblocking. Ignored .openspec.yaml metadata remains local.
- ST-0002: in progress; developer stage; review/test cycles 0.

## ST-0002 verified / pending commit
- reviewer: Approve, no findings. tester: complete existing coverage, no edits.
- checks: uncached users-application lint/test 72 in 12 files; strict spec tsc; diff check PASS.
- coverage users-app.service.spec.ts: Create reloads the last page; parameterized update/deactivate reload; all three select latest query after persistence and succeed before reload; Failed create does not reload; no reload before first list; lookup no reload; Stale load is cancelled; stale failure ignored; saved mutation stays successful while reload fails independently. Controlled promises prove mutation does not await reload.
- permitted baseline whitespace included as routine formatting of explicitly refactored facade; no unrelated behavior.
- pending-commit: {"task": "ST-0002", "files": ["libs/users/application/src/lib/services/users-app/users-app.service.ts", "libs/users/application/src/lib/services/users-app/users-app.service.spec.ts", "openspec/changes/shared-use-case-runner/tasks.md", "openspec/changes/shared-use-case-runner/progress.md"], "hashes": {"libs/users/application/src/lib/services/users-app/users-app.service.ts": "dcfb1a377a4bc8b9287c23943df2653016983c0e940d10ac64b2530fb509e0df", "libs/users/application/src/lib/services/users-app/users-app.service.spec.ts": "197821192de9fffb1b15622f129acfd4734be2b23a4ff60624f52c4645fbd070"}, "pre_commit_HEAD": "ba48bfa0e94cee8b3bb92e9a7393497179262146", "message": "refactor(users-application): delegate operation lifecycles to shared runner\n\nST-0002 users adoption\n\nChange: shared-use-case-runner"}
