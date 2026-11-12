# Ship progress

- work branch: change/users-domain-application (prepared feature branch; change branch absent)
- start commit: 23830cd807bdc833275a6de2139389679d9e0dd7
- commit: on
- precheck: openspec validate passed; one atomic public-API task, separate review and final run required.
- architecture: skipped; no new layer/library/port; bounded application migration.
- prep: skipped; ST-0001 covers all eight scenarios.
- selected ADR: docs/adr/0003-users-model-and-application-ports.md
- constraints: no archive of this or base change; no push; preserve unrelated workflow edits.
- unrelated pre-existing work: .agents/README.md, roles/analyst.md, roles/orchestrator.md, roles/tester.md, skills/openspec-archive-change/SKILL.md, skills/ship/SKILL.md, .codex/agents/orchestrator.toml, .gitignore, AGENTS.md, untracked .agents/codex-workflow.md.
- ST-0001: in progress; fix cycles 0.

## ST-0001 verification
- Reviewer: approved implementation and final conventions/assertion deltas; no findings.
- Tester: all eight scenarios pass; strengthened exact facade messages/field issues.
- Checks: Nx users-application lint/test green uncached (12 files, 57 tests); strict spec tsc --noEmit green; diff check green.
- Scenario evidence: enum public imports -> enums/users-error-kind/users-error-kind.enum.spec.ts :: Consumer imports all error kinds.
- Model construction/rejection/validation narrowing/unknown narrowing/serialization -> models/users-error/users-error.spec.ts :: matching Scenario tests.
- Validation/missing user -> services/users-app/users-app.service.spec.ts :: Invalid email on create is validation; Not-found is reported as kind.
- Repository details -> commands/create-user/create-user.spec.ts :: preserves repository %s details; facade Failed create reports error / Unknown kind has an optional cause.
- Fix cycles: 0; protected conventions write completed with explicit retry authorization.

## Completed commit record
- task: ST-0001
- pre-commit HEAD: 23830cd807bdc833275a6de2139389679d9e0dd7
- proposed message: refactor(users-application)!: centralize error kinds in an enum
- files and verified SHA256:
  - .agents/rules/engineering-conventions.md: 8bb27966b21625786960e464821c7c97521f68f846829a765f7c36d38df0e33e
  - libs/users/application/src/index.spec.ts: d6174fced7013d4d43850909678310db0dbceba1f692616cb3c152deffa5759a
  - libs/users/application/src/index.ts: edaaaf1a1dfb9636956874709b389f4380bb2153eccedf82df5d5e63db1f3537
  - libs/users/application/src/lib/models/users-error/users-error.spec.ts: 26dd9c7fcfb31f6b84f4b5ef97d711cac9f7df0ef08973475024372464830b82
  - libs/users/application/src/lib/models/users-error/users-error.ts: 644cbe1edd6501e58d6fdd024c36204c465a0183118f67e18a31f4bb3432d03c
  - libs/users/application/src/lib/services/users-app/users-app.service.spec.ts: 6e1bc0989f4380bd1a2c6143aa3c1bb17eae53baca8ac2c0f641cf57a234b8f6
  - libs/users/application/src/lib/use-cases/commands/create-user/create-user.spec.ts: 447267492f5e2a1126474b795152a85aa2afdb1f0bfb48d55551f5f619e366ed
  - libs/users/application/src/lib/use-cases/commands/deactivate-user/deactivate-user.spec.ts: 22dea79d7d505890935aacb236d51ec251900247fa042bb6d9ae21bb6fd28313
  - libs/users/application/src/lib/use-cases/commands/get-user/get-user.spec.ts: 167bb1c7e985880646a28a4e29d630cbaa71b81e4a7a9a673b6dbad03f145601
  - libs/users/application/src/lib/use-cases/commands/load-users/load-users.spec.ts: 1a4d3b2a940ff1616586632cf382fe047aed5757764c29f4cd6120460b1a655a
  - libs/users/application/src/lib/use-cases/commands/update-user/update-user.spec.ts: 274e54c2ec5b9049c04ae8df25d355415580dcdee9f457c56ddd9ec7111f213d
  - libs/users/application/src/lib/use-cases/domain-error/to-users-validation-error.ts: 1775f3ff631a712860752b58d1b8ff1ee8d186e159906b1e157e4f9e69d98b0c
  - libs/users/application/src/mock/user-repo.contract.ts: 1f63a862f36ed4c187b3c76ebecd17eb8568fe4d3679545b88b573362c26c926
  - libs/users/application/src/mock/user-repo.mock.ts: 1ad9e3f1a7f35bdd4373ed70e48089c53b20a1b14e27baf20ae221bcaef3f472
  - libs/users/application/src/lib/enums/users-error-kind/users-error-kind.enum.spec.ts: 1e2cc1d6962e75b5de605873dec2748362241160bcebd1c186f82290adb59472
  - libs/users/application/src/lib/enums/users-error-kind/users-error-kind.enum.ts: 5ce96783cc53a70913a13a5513066b5c18f9db1a64aea601884b8ef8e379c8f2
  - openspec/changes/users-application-error-kind-enum/.openspec.yaml: b8f20def63a86ae4075c5499ff9ed413265d8704692a8493712424dc3f28d8e3
  - openspec/changes/users-application-error-kind-enum/design.md: 7e9174e255c80ae37507acf7b5ca04b71a14a62b15e783f7f6337d5a61266621
  - openspec/changes/users-application-error-kind-enum/proposal.md: 26d39227e2535fb7c136d1c2ac28e71d692b462dc0146927e43fa2d8b1c03a68
  - openspec/changes/users-application-error-kind-enum/specs/users-application/spec.md: 0aad0838420da7d9080b63375a71f859e4e4182c7245f59bd73ee47b505b00ad
  - mutable checklist/journal: openspec/changes/users-application-error-kind-enum/tasks.md, openspec/changes/users-application-error-kind-enum/progress.md

- ST-0001 committed: ba9087a; pending record cleared; hooks passed. Commitlint footer-leading-blank warning nonblocking.

## Final run
- Passed at ba9087a; start 23830cd807bdc833275a6de2139389679d9e0dd7.
- Complete 22-path task scope plus journal; unrelated working edits excluded.
- Nx affected -t test lint build with explicit files, skipNxCache, static output: users-application only, no consumers.
- 57 tests in 12 files and lint passed uncached. No applicable build; internal test-build excluded, empty shell:test outside scope.
- Initial socket EPERM resolved through native escalation; no failures/edits.

## Acceptance and final report
- Analyst: ACCEPT at ba9087a; all eight scenarios satisfied, no required fixes or scope creep.
- ST-0001 [x], review/test fix cycles 0; commit ba9087a.
- Summary: public application-owned regular error-kind enum; six original runtime strings retained; member union/producers/mock/tests migrated; narrow conventions exception.
- Breaking TypeScript API: construct UsersError.kind with UsersErrorKindEnum members.
- Checks: application lint, 57 tests/12 files, strict spec typechecks, final affected checks all passed.
- Warnings: nonblocking commitlint footer-leading-blank and existing Husky deprecation warnings.
- No unresolved risks or follow-ups beyond the declared TypeScript consumer migration.
- User declined archive of both active changes; no archive/sync/push performed. Local branch remains change/users-domain-application.
- Post-commit verification/acceptance journal retained uncommitted; unrelated initial working files preserved.
- Telemetry: model/input/cached token counters unavailable; empty waits not measured separately by host.

## Authorized consolidated archive — 2026-11-12

User approved latest-authoritative consolidated sync and archive in reverse creation order.
Archive target: openspec/changes/archive/2026-11-12-users-application-error-kind-enum
Work branch: change/users-domain-application; commit: on; no push or release.
Read-only analyst APPROVE: current shared ErrorKindEnum, role/status enums, mixed kernel
symbol purity, shared runner/completedStatus, status-identity race protection and no draft
time parameter are retained. Superseded historical delta contracts remain historical.
Main specs validation: 5 passed, 0 failed; two existing long-requirement warnings.
Future resource-based infrastructure handling remains a planning decision, no runtime migration.
Backups and CLI snapshots: /tmp/showtime-archive-2026-11-12.
