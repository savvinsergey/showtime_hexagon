# Progress

- start commit: 6864de74cdcff370130c2b9deb1e38f53fdaae60
- work branch: change/users-domain-application
- Precheck: OpenSpec validation passed; clean initial working tree; 12 unchecked tasks.
- Architecture: complete; design refined and linked ADR-0001, ADR-0002, ADR-0003.
- ADRs: docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md; docs/adr/0002-framework-free-shared-kernel.md; docs/adr/0003-users-model-and-application-ports.md.
- Prep: checking coarse tasks and dependency order before implementation.

- Prep complete: all 50 scenarios mapped; ST-0013 split from ST-0007; dependency order corrected. OpenSpec revalidation passed.
- Order: ST-0001, ST-0003, ST-0002, ST-0004, ST-0005, ST-0006, ST-0007, ST-0013, ST-0009, ST-0010, ST-0011, ST-0008, ST-0012.
- ST-0001: in progress.

- ST-0001 blocked before generation: Nx plugin discovery hit Unix socket EPERM. Escalated `NX_DAEMON=false NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-ws-data npx nx list @nx/angular` was aborted by user. No production/config changes or commits; waiting for user decision before retry.

- ST-0001 implementation ready: scaffold, alias, prerequisite missing conventions import fixed. Developer lint/test passed (1 smoke); Angular probe rejected. Reviewer approved with no findings. Tester inspected scaffold/purity coverage; verification blocked when escalated nx show project request was aborted. Task remains unchecked; no commits.

- ST-0001 complete: reviewer approved; tester green, nx lint/test uncached and 91 lint-convention tests passed. Coverage: Angular rejection -> tools/lint/conventions.test.mjs :: pureConventions > rejects @angular/core; scaffold -> libs/users/domain/src/index.spec.ts :: loads the framework-free public entry point. Graph deferred ST-0012.

- ST-0001 commit hook prerequisite: root conventions now exclude generated spartan-ui per existing rules; shared-spartan-ui/users-domain lint passed; reviewer approved. Hook-only project.json formatting retained.

- ST-0001 commit: 50e1e68 (hooks passed; commitlint non-blocking footer warning).
- ST-0003: in progress.

- ST-0003 complete: reviewer approved no findings; tester lint/test green uncached. Coverage (libs/users/domain/src/lib/): valid/empty/malformed email -> value-objects/email/email.spec.ts :: named scenarios and malformed-input cases; valid/empty name -> value-objects/full-name/full-name.spec.ts :: named scenarios; known/unknown role -> value-objects/user-role/user-role.spec.ts :: accepts known role / rejects unknown role; unknown status -> value-objects/user-status/user-status.spec.ts :: Scenario: Unknown status is not a domain value (compile-time check).

- ST-0003 commit: a553e36 (hooks passed).
- ST-0002: in progress.

- ST-0002 complete: reviewer approved, tester lint/test green uncached. Coverage: User serializes without wrappers; User fields are not mutated in place; Draft omits id -> libs/users/domain/src/lib/models/user/user.spec.ts :: corresponding Scenario names. Id stays a plain string; Foreign id is not assignable -> libs/users/domain/src/lib/value-objects/user-id/user-id.spec.ts :: corresponding Scenario names; type checks use @ts-expect-error.

- ST-0002 commit: cf15bcd (hooks passed).
- ST-0004: in progress.

- ST-0004 complete: reviewer approved; warning unused _now for specified draft signature (documented, no timestamp field). Tester lint/test green uncached. All ST-0004 scenarios -> libs/users/domain/src/lib/services/users-domain/users-domain.spec.ts :: same-named Scenario tests (draft/noid/role/input/time, activate/deactivate, rename, changeRole, registered id/time). Tests verify unchanged inputs and frozen outputs.

- ST-0004 commit: 98604c8 (hooks passed). Four tasks complete; continuing locally per Codex host adapter.
- ST-0005: in progress.

- ST-0005 complete: reviewer approved; tester application lint/test green cache; 91 convention tests passed,8 projects tagged. Coverage: scaffold -> libs/users/application/src/index.spec.ts :: loads the public entry point; Temporary infrastructure import fails lint -> tools/lint/depconstraints.test.mjs :: rejects application -> infrastructure plus removed real Nx rule probe onlyTagsConstraintViolation (domain control allowed). Graph deferred0012.

- ST-0005 commit: 326d778 (hooks passed).
- ST-0006: in progress.

- ST-0006 complete: review approved; tester lint/test green uncached. System clock is the default; Tests can fix the clock -> libs/users/application/src/lib/clock/clock.token.spec.ts :: same-named Scenario tests. Unknown kind has an optional cause -> models/users-error/users-error.spec.ts :: same-named Scenario test. Error/status/call type checks -> models/users-error/users-error.spec.ts and models/use-case-call/use-case-call.spec.ts.

- ST-0006 commit: 15a6614 (hooks passed).
- ST-0007: in progress.

- ST-0007 complete: reviewer approved; tester resumed after auth interruption and lint/test green cache. Remove is not on the port -> ports/driven/user-repository/user-repo.port.spec.ts :: same-named Scenario; promised Result inputs -> accepts application/domain inputs and returns promised Result values. Query is not on the state port -> ports/driven/users-state/users-state.port.spec.ts :: same-named Scenario; signals/sync -> exposes page signals and a synchronous replacement command. Paths under libs/users/application/src/lib. Narrow naming exemption retains mandated UserRepositoryPort name.

- ST-0007 commit: cb71a60 (hooks passed).
- ST-0013: in progress.

- ST-0013 complete: review approved; contract warning addressed by tester multi-page/total/missing-save tests. Lint/test green uncached. Create takes a draft and returns a user with id -> src/mock/user-repo.contract.ts :: same-named Scenario; Set page replaces the list -> src/mock/users-state.contract.ts :: same-named Scenario; Spec can provide mocks -> src/mock/ports.mock.spec.ts :: same-named Scenario (public alias). Production file cannot import mocks -> tools/lint/conventions.test.mjs :: rejects the mock import in a regular file plus removed application probe. Mock paths under libs/users/application; exact alias exception only spec/mock.

- ST-0013 commit: 7139eef (hooks passed).
- ST-0009: in progress.

- ST-0009 complete: review approved; tester lint/test green uncached. Invalid email on create is validation -> use-cases/commands/create-user/create-user.spec.ts :: same-named Scenario; Unknown kind has an optional cause -> preserves repository unknown details; conflict -> preserves repository conflict details; assigned user/fixed clock -> successful-persistence tests. Paths under application/src/lib. Discarded registration fact evidenced by saved.ok branch using persisted user/injected timestamp plus domain Scenario: Registered event uses the user's id (no observable application event output by design).

- ST-0009 commit: 45b229a (hooks passed).
- ST-0010: in progress.

- ST-0010 complete: small task tester review+test approved, lint/test green uncached. Not-found is reported as kind -> use-cases/commands/get-user/get-user.spec.ts :: same-named Scenario; query/result forwarding and no state writes -> use-cases/commands/load-users/load-users.spec.ts. Paths under application/src/lib. Race/listStatus deferred0008.

- ST-0010 commit: 6fb7786 (hooks passed).
- ST-0011: in progress.

- ST-0011 complete: tester review+test approved no Critical; lint/test green uncached. Invalid rename is validation -> use-cases/commands/update-user/update-user.spec.ts :: same-named Scenario plus valid transition/invalidrole/lookup/conflict tests. Deactivate immutable save/lookup/forbidden -> use-cases/commands/deactivate-user/deactivate-user.spec.ts. Paths under application/src/lib; reloads deferred0008.

- ST-0011 commit: 07a0640 (hooks passed).
- ST-0008: in progress.

- ST-0008 complete: reviewer approved no findings; tester lint/test green uncached. Commands and reads share one token; Successful create reports success; Failed create reports error; Result is not used to derive loading; Create reloads the last page; Failed create does not reload; Stale load is cancelled -> services/users-app/users-app.service.spec.ts :: same-named Scenario tests. Update/Deactivate reloads -> Scenario: %s reloads the last page. Use-cases are not exported; User type is exported from application -> src/index.spec.ts :: same-named Scenarios. Additional controlled promises cover late stale failure, independent reload failure, no initial load, validation/notfound. Paths under libs/users/application/src/lib except barrel spec.

- ST-0008 commit: 164f870 (hooks passed).
- ST-0012: in progress.

- ST-0012 complete: developer integration green; tester review+test approved and independently checked .nx/workspace-data/project-graph.json exact edges/tags. Domain depends only on kernel -> users-domain edge shared-kernel only (real domain service/id imports). Application graph excludes infrastructure -> users-application edges users-domain/shared-kernel only (clock/barrel). npm test:lint91; domain56tests/8files, app54/13files, kernel50/10files;6 lint/test targets; shell production build green. shell:test excluded per design. No code edits.

- ST-0012 commit: e22704e. Final-run green at e22704e from base6864de74: nx affected tests (only shell:test excluded) + affected lint/build,13 targets passed6cachehits. Domain56,app54,kernel50,shared-ui16 tests; all8project lints and shell production build passed. No flaky/failing tests. Nonblocking existing warnings: draft _now, Nx lint executor deprecation, Angular test target normalization, shell federation module type.

- Acceptance: analyst ACCEPT, all50scenarios satisfied, all13tasks complete. Reviewed6864de74..e22704e plus finalrun note; no required fixes, scope/design ADR0001/2/3 conform, no breaking changes. Final totals176project tests +91convention tests,8lints,shell build. Archive pending explicit user confirmation.

## Approved review corrections
Reopened ST-0001 (pure kernel structure and boundary), ST-0006 (shared clock and generic contracts), ST-0008 (Users facade API) and ST-0012 (Angular 22 conventions, owned components and integration verification) before implementation. Previous acceptance is superseded. Work branch change/users-domain-application, commit on, original base retained; correction baseline 3f58113. Separate developer/reviewer/tester stages for every reopened task, then final verification and whole-change acceptance. User deferred archive. Preserve pre-existing workflow, AGENTS.md and .gitignore edits.

Correction planning: architecture and prep complete, strict validation green; ADRs 0001–0003 and four delta capabilities. ST-0001 in progress.

ST-0001 complete. Reviewer approved after one fix cycle (constant-template lazy imports). Tester verified 14 boundary/grouping regressions in tools/lint/kernel-entry.spec.ts: Kernel dependencies are empty; Domain cannot reach the Angular kernel entry; Pure kernel cannot re-export its Angular integration; Angular/RxJS rejection. Sole domain graph edge shared-kernel; four uncached Nx targets green, 81 project tests, 105 lint-rule tests plus tag checks.
Commit 4c2583f.
ST-0006 in progress.

ST-0006 complete. Reviewer approved first pass. Generic errors stay with their consumer -> shared/kernel/src/angular/use-case-call/use-case-call.spec.ts (independent status/result errors); clock default/fixed -> angular/clock/clock.token.spec.ts; Users compatibility token identity -> users/application/src/index.spec.ts; Unknown kind optional cause -> services/users-app/users-app.service.spec.ts. Kernel 30, Users application 52 tests uncached, both lints green; 105 rule tests and tags pass.
Commit eb5f23d.
ST-0008 in progress.

ST-0008 complete. Reviewer approved first pass. Users specializes shared contracts -> libs/users/application/src/index.spec.ts :: Users specializes shared contracts (all five exact command signatures + listStatus). Existing public-entry and facade suites cover all 12 assigned scenarios. Uncached application lint and all 53 tests passed.
Commit 96925a3.
ST-0012 in progress.

ST-0012 complete. Installed Angular 22.1.6 verified; removed seven redundant declarations and documented implicit OnPush. One tester fix cycle: real Angular ESLint configs inherited OnPush rule. Reviewer approved explicit override after preset; tester verified Owned component omits redundant metadata and Explicit strategy override is preserved -> tools/lint/change-detection.spec.ts (all three real project configs with autofix). 107 lint tests and tags green; 155 Angular tests, 6 project lints, shell build uncached; exact Users graph/tags verified. shell:test excluded (empty suite), layout has no test target.
Commit e8d7fe9.
All reopened tasks complete. Final-run in progress at e8d7fe9 from 6864de74.

Final-run complete at e8d7fe9603bb70002b1561fb9c5d6672ef25cf3f from original base 6864de74cdcff370130c2b9deb1e38f53fdaae60. Scoped --files to 116 changed/task-owned paths, excluding unrelated workflow edits. All eight project lints and shell production build passed (0/9 cache hits). Affected tests passed 155 across 30 files: kernel30/domain56/application53 cached, shared-ui16 fresh. Only shell:test excluded per empty-suite design exception. npm test:lint107 and eight-project tag checks passed. Strict OpenSpec validation passed. Nonblocking existing warnings: unused _now, Nx ESLint deprecation, Angular compiler normalization, module-type/color notices. Whole-change acceptance in progress.

Acceptance complete: analyst ACCEPT for 6864de74..e8d7fe9 plus final-run note. All 59 scenarios satisfied, all 13 tasks checked, no required fixes. Confirmed four user corrections: authoritative grouped kernel primitives, Angular 22 implicit OnPush with explicit Eager preserved, single shared CLOCK through Angular entry and protected pure entry, generic operation contracts specialized with UsersError. Updated proposal/delta specs/design and ADR0001–3 conform. All corrective commits are local on change/users-domain-application; archive deferred by explicit user instruction.
Correction commits: ST-0001 4c2583f (one review fix cycle); ST-0006 eb5f23d (first-pass approval); ST-0008 96925a3 (first-pass approval); ST-0012 e8d7fe9 (one tester fix cycle). Pre-existing workflow/.gitignore/AGENTS.md changes preserved and excluded from task commits.
Telemetry: orchestrator empty wait timeouts 1 during final acceptance; model calls, input tokens and cached input counters unavailable. Specialist and dispatcher telemetry unavailable here.

Final acceptance evidence persisted.
