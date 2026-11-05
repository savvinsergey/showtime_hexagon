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
Pending commit ST-0001 at 3f58113aedddd270e31036760653bdca1b38cfd1, message refactor(shared-kernel): consolidate primitives and enforce pure entry boundaries. Verified files (SHA-256; checklist and journal also included):
- .agents/rules/engineering-conventions.md 139f655e407a4a66f1e3fa5d92fc73c72c93d79acbd5365cc8a930fceda8d53a
- docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md f279db6517a65435be76f01b877b84a5f91f50f1dfb160a5f809ae731bc50c62
- docs/adr/0002-framework-free-shared-kernel.md ff48b033d7cf5352194ba643d5a78a311dfb538cce6c23065f305622d58065f5
- docs/adr/0003-users-model-and-application-ports.md 0c1ce4808363100f4929dcb739a15e9e9cd9e419a4f01fad43633e04427ce4fb
- eslint.conventions.mjs 2d72223efcfcad04c4bf107e6a6f9a97487c10137769f382527718468be2ff94
- libs/shared/kernel/eslint.config.mjs 1dee287c23bc42821956607ae61c9a8d1186c6cd98cdb2b8577bb61dc69f8501
- libs/shared/kernel/src/index.ts b6b611725bf7576a3f2158bd17e25929b4ac595e48f75ea4d34ee2149bf23ad1
- libs/shared/kernel/src/lib/clock.spec.ts deleted
- libs/shared/kernel/src/lib/clock.ts deleted
- libs/shared/kernel/src/lib/clock/clock.ts e0c2f00b6f55a09c961ace188b069b7526732f94ad37ce6d5ab7e02fbfe2bae1
- libs/shared/kernel/src/lib/domain-error.spec.ts deleted
- libs/shared/kernel/src/lib/domain-error.ts deleted
- libs/shared/kernel/src/lib/domain-event.spec.ts deleted
- libs/shared/kernel/src/lib/domain-event.ts deleted
- libs/shared/kernel/src/lib/id.spec.ts deleted
- libs/shared/kernel/src/lib/id.ts deleted
- libs/shared/kernel/src/lib/result.spec.ts deleted
- libs/shared/kernel/src/lib/result.ts deleted
- nx.json 61646c4c68b61d772537c667c824d802708fb925589639d1dceabe8575b21c83
- openspec/changes/users-domain-application/design.md 7a748f508f32c258396637fe32719ae89da2ce06236a7aef4005395be2e4ae21
- openspec/changes/users-domain-application/proposal.md af14087ef4c794758f2148888b2fedef251a29a44e564e775576f5dff441d087
- openspec/changes/users-domain-application/specs/users-application/spec.md 858724d9233c23fd38c85f5ce881b5df5746aaa3b1384a21b99ba95bdbb2cab0
- tools/lint/conventions.test.mjs 735c692c82da3be3397d0b96f46ceb0a8fe1f672a4c084352d71e3c9a9c2139c
- openspec/changes/users-domain-application/specs/shared-kernel/spec.md 2f82d0ef3beb9d7927fd336a1631eadacff7001654c71e76b98006c106ec5432
- openspec/changes/users-domain-application/specs/workspace-boundaries/spec.md a3b36c841e893969b36edb4363b715320ee6356142f6cef1d09105342e4ce95e
- tools/lint/kernel-entry.mjs 4a3c02a281e7a280e5e9b231f62773a672ae3cd6cbc4e577f286da01d83971b3
- tools/lint/kernel-entry.spec.ts 37f4b7bb223c5035ee62d8d38f0d95b06220a36bd9839eeb4e13eeb12ed588b3
