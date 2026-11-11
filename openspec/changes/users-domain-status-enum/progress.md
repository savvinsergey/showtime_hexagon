# Delivery progress: users-domain-status-enum

- work branch: change/users-domain-application (target branch absent; existing feature branch reused)
- start commit: 01612df4cb2f44b0a84f05ebdfccb08168f5ebfe
- commit: on
- Precheck: artifacts read; openspec validate users-domain-status-enum passed.
- User decisions: approved ship; no archive or push; preserve unrelated edits. Mixed documentation remains uncommitted rather than partial staging.
- Architecture: in progress (two-library public API migration).
- Prep: skipped; ST-0001 is intentionally atomic and covers all five scenarios.
- ST-0001: not started. Fix cycles: 0. Final-run cycles: 0. Acceptance cycles: 0.
- Existing unrelated work: workflow/roles/skills/AGENTS/.gitignore, prior change journals/checklists, infrastructure note, mixed engineering conventions/examples; exclude from staging.

## Architecture
Completed: existing inward dependencies retained; no new layer/library/port. ADR-0002 present-tense status guidance aligned.
Selected ADRs (design Decisions cross-checked by architecture):
- docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md
- docs/adr/0002-framework-free-shared-kernel.md
- docs/adr/0003-users-model-and-application-ports.md
Architecture outputs for first task commit: design.md and docs/adr/0002-framework-free-shared-kernel.md.

## ST-0001
In progress: developer assigned atomic enum migration and five scenarios; full reviewer and independent tester required.

Developer complete: domain-owned UserStatusEnum, alias/guard, domain/application exports, fixtures/producers and type/identity tests migrated. Narrow conventions update approved via host and applied; active users-domain-application design/tasks aligned (mixed docs excluded from commit).
Checks: uncached domain tests 74, application tests 68; both lint passed (existing domain `_now` warning); strict spec typechecks both passed; boundary suite 126 passed, tags 8 valid/63 hidden; diff whitespace clean. Workspace literal audit completed. Initial application self-alias lint issue fixed, retry passed. No live sessions.
Review: full reviewer assigned. Fix cycles: 0 (developer self-check fix before review).

Review: Approve, no Critical or scope warnings. Independent tester: green, no missing coverage; no edits or redundant test runs.
Scenario coverage:
- Status enum preserves serialized values -> domain/lib/enums/user-status/user-status.enum.spec.ts and application/src/index.spec.ts :: Scenario: Status enum preserves serialized values.
- Typed models require status enum members -> domain/lib/models/user/user.spec.ts :: Scenario: Typed models require status enum members (User and UserDraft, raw active/inactive/unknown rejected; readonly intent retained).
- Raw valid statuses narrow to enum -> domain/lib/value-objects/user-status/user-status.spec.ts :: accepts known status %s.
- Invalid raw statuses are rejected -> same file :: rejects unknown status %j.
- Lifecycle operations use enum values immutably -> domain/lib/services/users-domain/users-domain.spec.ts :: Scenario: Valid input becomes an active draft; Scenario: Activate sets active and emits an event; Scenario: Deactivate sets inactive and emits an event.
Paths above are under libs/users/. Known domain/application targets: lint,test,test-build; no public build; test-build is internal harness. Final affected consumers still to discover.

## Pending commit
```json
{
  "task": "ST-0001",
  "pre_commit_HEAD": "01612df4cb2f44b0a84f05ebdfccb08168f5ebfe",
  "files": [
    "docs/adr/0002-framework-free-shared-kernel.md",
    "libs/users/application/src/index.spec.ts",
    "libs/users/application/src/index.ts",
    "libs/users/application/src/lib/services/users-app/users-app.service.spec.ts",
    "libs/users/application/src/lib/use-cases/commands/create-user/create-user.spec.ts",
    "libs/users/application/src/lib/use-cases/commands/deactivate-user/deactivate-user.spec.ts",
    "libs/users/domain/src/index.ts",
    "libs/users/domain/src/lib/enums/index.ts",
    "libs/users/domain/src/lib/models/user/user.spec.ts",
    "libs/users/domain/src/lib/services/users-domain/users-domain.spec.ts",
    "libs/users/domain/src/lib/services/users-domain/users-domain.ts",
    "libs/users/domain/src/lib/value-objects/user-status/user-status.spec.ts",
    "libs/users/domain/src/lib/value-objects/user-status/user-status.ts",
    "libs/users/domain/src/lib/enums/user-status/user-status.enum.spec.ts",
    "libs/users/domain/src/lib/enums/user-status/user-status.enum.ts",
    "openspec/changes/users-domain-status-enum/.openspec.yaml",
    "openspec/changes/users-domain-status-enum/design.md",
    "openspec/changes/users-domain-status-enum/progress.md",
    "openspec/changes/users-domain-status-enum/proposal.md",
    "openspec/changes/users-domain-status-enum/specs/users-domain/spec.md",
    "openspec/changes/users-domain-status-enum/tasks.md"
  ],
  "sha256": {
    "docs/adr/0002-framework-free-shared-kernel.md": "6d841ab7a58f3f9e05000b3127f3b08b6f9c5248755103f839308bfb80608e4b",
    "libs/users/application/src/index.spec.ts": "a9a439fccc72b377ff4ac53012d48d0ad5fd8936402b885792d24ab6dbd9b05e",
    "libs/users/application/src/index.ts": "a2baa33b5aa67450a4b40f51beaf67bda70558eca4358f41b87a268a05aabdaf",
    "libs/users/application/src/lib/services/users-app/users-app.service.spec.ts": "0bf600b6958135c8c35af31ff3f1ae0dbd87d28d2ef62ddf558ec9ed61cd1cec",
    "libs/users/application/src/lib/use-cases/commands/create-user/create-user.spec.ts": "12d1f26fb2a0f35fe1e22f8f35ccc1414020d48006e15a372fbe06b056e136b4",
    "libs/users/application/src/lib/use-cases/commands/deactivate-user/deactivate-user.spec.ts": "ee3fe1387d7249da820e5040a63e1f82d0244a7c1107cd6554ed8d327a38f81e",
    "libs/users/domain/src/index.ts": "4913778d2204965fb2166dc65808649de9999c4ebe8086b79641e42f5ff0417f",
    "libs/users/domain/src/lib/enums/index.ts": "fca1b0caaa552e7a67d3ab9bc38ef5007677f832275e8db5a2c3547ebfc22537",
    "libs/users/domain/src/lib/models/user/user.spec.ts": "1da9d7e2ff25133caf07a65952eaa6d97d4d5ab09eb0db3d791de8b2df88d1fd",
    "libs/users/domain/src/lib/services/users-domain/users-domain.spec.ts": "d5712f4975eeb0d3bc4f711237432e8ab102de88e82c2f4669571222c5cbefa0",
    "libs/users/domain/src/lib/services/users-domain/users-domain.ts": "4d1c861698547f495a3b76d6e3ec51a1607ae98ff6539b89c6ce8f4f2424bcbb",
    "libs/users/domain/src/lib/value-objects/user-status/user-status.spec.ts": "5446b2843f6519bf9cab58ecb57ce9408eb95d6ada9a493abfba39729f6e4321",
    "libs/users/domain/src/lib/value-objects/user-status/user-status.ts": "bac8220622246a8939dbad12cbd47c76ebe62798c400ad653fd74338f3661a34",
    "libs/users/domain/src/lib/enums/user-status/user-status.enum.spec.ts": "5fc4cd78814dee1694c88ebb1d279f33fb77cc8918c954d4e6634b64c454b9d4",
    "libs/users/domain/src/lib/enums/user-status/user-status.enum.ts": "5c675498deb751902a7cf80bf950c3ccbb178c7f71d1bcb7622a4df6c58c8e55",
    "openspec/changes/users-domain-status-enum/.openspec.yaml": "b8f20def63a86ae4075c5499ff9ed413265d8704692a8493712424dc3f28d8e3",
    "openspec/changes/users-domain-status-enum/design.md": "1ce79d4d6cb281f9722311efb0960e68b8f62c7b1eb269b7ef12aa571cd4c41d",
    "openspec/changes/users-domain-status-enum/proposal.md": "c224f597cdbe83fa97f8a7503731abf6a78e1e98ec0b7786a3ef477d26fa2fb3",
    "openspec/changes/users-domain-status-enum/specs/users-domain/spec.md": "52f7ac56bb763e77f0a0ab48bbc0f5a5d0218954e95d8a67070d16fb46fc28ca"
  },
  "message": "refactor(users-domain)!: centralize user status enum"
}
```
