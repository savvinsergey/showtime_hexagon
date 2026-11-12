# Tasks

## 1. Status enum migration

- [x] ST-0001 Add authoritative UserStatusEnum.Active/Inactive under users/domain/enums/user-status with colocated serialization/type tests and JSDoc; preserve UserStatus as its type alias and update the guard to enum comparisons. Export through domain and application public entries with identity tests. Replace status literals across normal domain/application/mock producers, consumers and fixtures with enum members; retain explicit raw boundary, invalid-input and wire-compatibility test cases. Verify every workspace UserStatus consumer. Preserve readonly test intent using enum reassignment and separate @ts-expect-error cases for raw/invalid statuses. Exercise draft/activate/deactivate invariants, event data and unchanged originals. Narrowly align conflicting status-union documentation/conventions while preserving unrelated work. Verify uncached `npx nx run-many -t lint,test -p users-domain,users-application --skipNxCache`, strict spec typechecks, boundary suites/tags and absence of unintended literal usages. (covers: users-domain/Status enum preserves serialized values; users-domain/Typed models require status enum members; users-domain/Raw valid statuses narrow to enum; users-domain/Invalid raw statuses are rejected; users-domain/Lifecycle operations use enum values immutably)

## Workflow follow-up

- Full review/test, final affected verification for the public API change and whole-change analyst acceptance apply under ship.
- Preserve the existing work branch according to delivery branch rules and unrelated edits. No push or archive. Reconcile unarchived Users deltas only after explicit future archive approval.
