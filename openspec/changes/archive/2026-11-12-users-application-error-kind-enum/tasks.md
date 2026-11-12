# Tasks

## 1. Atomic application error-kind migration

- [x] ST-0001 Add application-owned `UsersErrorKindEnum` in `src/lib/enums/users-error-kind/users-error-kind.enum.ts` with all six original string values and JSDoc on the public enum/members. Export it from `@showtime/users/application`, use member discriminants in every UsersError variant, and migrate validation mapping, mocks, contract suites, typed fixtures, parameter tables and comparisons in the same compiling change. Preserve fieldIssues, optional unknown cause and all failure propagation. Add the narrow approved enum exception/location to engineering conventions. Add colocated enum tests, public-entry identity tests, serialization tests, positive and negative model type checks, and update existing use-case/facade tests. Run `npx nx lint users-application` and `npx nx test users-application`, verifying strict spec type checks for negative assertions. Review the complete application diff for remaining raw kind constructors (only deliberate negative/serialization expectations may retain strings). No generator, new project, port or dependency is needed. (covers: users-application/Consumer imports all error kinds; users-application/Enum members construct all error variants; users-application/Unsupported and raw kinds are rejected; users-application/Validation narrowing retains field issues; users-application/Unknown narrowing retains optional cause; users-application/Error serialization is unchanged; users-application/Validation and missing-user results are preserved; users-application/Repository failures retain details)

## Verification and acceptance

This single public-API task requires separate developer, reviewer and tester stages, final affected verification and whole-change analyst acceptance under ship. Record scenario evidence before committing. Use the breaking commit marker/footer for the TypeScript API migration; no versions or tags. Preserve unrelated working-tree edits. Exclude the existing empty shell:test and internal test-build harness from standalone build checks as documented in design.md.

## Workflow follow-up

- Do not archive `users-domain-application` or this change without explicit user confirmation.
- If archives are later requested, synchronize the base users application capability before this additive delta.
