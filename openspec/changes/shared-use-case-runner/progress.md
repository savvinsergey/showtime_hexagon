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
- pending-commit: {"task": "ST-0001", "files": ["docs/adr/0002-framework-free-shared-kernel.md", "docs/adr/0003-users-model-and-application-ports.md", "eslint.conventions.mjs", "libs/shared/kernel/src/index.ts", "libs/shared/kernel/src/lib/utils/run-use-case/run-use-case.ts", "libs/shared/kernel/src/lib/utils/run-use-case/run-use-case.spec.ts", "tools/lint/kernel-entry.spec.ts", "openspec/changes/shared-use-case-runner/.openspec.yaml", "openspec/changes/shared-use-case-runner/progress.md", "openspec/changes/shared-use-case-runner/tasks.md", "openspec/changes/shared-use-case-runner/design.md", "openspec/changes/shared-use-case-runner/proposal.md", "openspec/changes/shared-use-case-runner/specs/shared-kernel/spec.md"], "hashes": {"docs/adr/0002-framework-free-shared-kernel.md": "4d2f75c66015eb5dae0585c357d239e898cb7b692de273c286fa24c6130b72de", "docs/adr/0003-users-model-and-application-ports.md": "b330143b6c2b23737d62906bb9fbcc20224816875060a3bdce176de11870cabf", "eslint.conventions.mjs": "37d68f1ab2c9d512c5cc66e45d761018ebb257483caa19b9c93fb0e7028c186c", "libs/shared/kernel/src/index.ts": "78b15ea4b320e6b8dbb7c9f21cba64035de596aaf61fca3f4af7269d657de946", "libs/shared/kernel/src/lib/utils/run-use-case/run-use-case.ts": "6d39883b9eeec7b8466f356e570b59f5668616f8dd1d08aff73f55445e908a12", "libs/shared/kernel/src/lib/utils/run-use-case/run-use-case.spec.ts": "2087b688a5a4caf26e8b223929d7dac881f7c2250f78fd839afceecd4f3387cf", "tools/lint/kernel-entry.spec.ts": "451e7dc2f753be4f1e161832ae689c36bd89039523b72abd13437f09240c783d", "openspec/changes/shared-use-case-runner/.openspec.yaml": "81efc95b309487579cc63ceff200744cbd9fab2401597cbbdcf38d0cb54bace8", "openspec/changes/shared-use-case-runner/design.md": "3aebafba64b8d401630043b973a15c8761a745b12b40189f07f5220e6d999cf5", "openspec/changes/shared-use-case-runner/proposal.md": "6f19034967568af3437eb3a5a838abd10621065f3e40ffd21f306d57b8714198", "openspec/changes/shared-use-case-runner/specs/shared-kernel/spec.md": "9b2f0d9acf173199c96adbdb4760b6dafd4986528962357ef6fb0fcee0776fa6"}, "pre_commit_HEAD": "865afe7c605b98be074027c6b4941755c391448a", "message": "refactor(shared-kernel): extract reusable use-case call runner\n\nST-0001 shared lifecycle helper\nChange: shared-use-case-runner"}
