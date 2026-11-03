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
