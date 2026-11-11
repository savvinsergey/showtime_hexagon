# Tasks

## 1. Enum-backed role contract and consumers

- [x] ST-0001 Introduce the authoritative UserRoleEnum in users/domain/enums/user-role with colocated tests and JSDoc; preserve UserRole as its type alias and update isUserRole to enum-based comparisons. Export through domain and application public entries. Atomically migrate typed domain/application/mock fixtures and normal known-role usages to enum members; preserve raw boundary inputs and literal wire assertions. Add positive/negative type tests, unknown/empty/whitespace/non-string guard cases and draft/change-role regression coverage. Align only conflicting role-union text in engineering conventions and active users-domain-application design/linked ADRs, preserving unrelated edits and UserStatus. Verify uncached `npx nx run-many -t lint,test -p users-domain,users-application --skipNxCache`, strict spec TypeScript checks for both libraries, boundary regression suites and explicit public enum identity. (covers: users-domain/Role enum preserves wire values; users-domain/Typed users require role enum members; users-domain/Raw supported roles still validate; users-domain/Invalid roles remain rejected)

## Workflow follow-up

- Run final affected verification for the public API change and whole-change acceptance under ship.
- Preserve current branch/user changes unless the approved delivery workflow explicitly selects another branch. Do not push or archive; future archive requires explicit approval and reconciliation with unarchived users-domain-application.
