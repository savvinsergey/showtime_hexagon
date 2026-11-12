# Design

## Context

See proposal.md. `value-objects/user-role/user-role.ts` currently owns a literal union and guard; User.role references it. Raw NewUser/UpdateUser and domain draft/change-role inputs are strings. Domain models and application fixtures contain typed literal roles. No infrastructure exists yet. Active design/conventions explicitly retain the union and must be aligned with this user-requested exception.

## Goals / Non-Goals

One authoritative role enum in the domain, preserved serialized strings, unchanged validation and transitions. Preserve the existing UserRole name as a type alias to the enum for source discoverability. Do not migrate status, change authorization, or introduce a new port/library.

## Approach

- Add `lib/enums/user-role/user-role.enum.ts` with UserRoleEnum.Admin/Member and colocated tests/JSDoc. Export it explicitly from domain public entry and re-export the same enum from application public entry because feature consumers use application only.
- Make UserRole a type alias to UserRoleEnum; guard comparisons use enum members and narrow raw input. Do not duplicate string constants or add casts to bypass validation. Keep the guard at its existing path and preserve safe import direction around the value-object/service barrels.
- Migrate typed fixtures in domain/application/mock to enum members. Keep literal expectations and raw invalid inputs where testing boundary behavior or JSON compatibility; normal known-role fixtures use enum members.
- Narrowly update engineering conventions and active users-domain-application design/ADR text referring to roles as unions; preserve all unrelated uncommitted hunks and historical progress records. Do not archive any change.

## Risks / Trade-offs

### Alternatives considered

1. Keep the string-literal union with an `as const` object: avoids a typed-source breaking change, but raw literals remain assignable to typed records and it does not satisfy the approved enum contract.
2. Use one domain-owned string enum and retain `UserRole` as its alias (selected): provides named typed roles and unchanged JSON strings; requires an atomic consumer migration and adds a small runtime enum object.
3. Define an application enum or mirror the domain enum there: avoids a public re-export but duplicates role knowledge and loses public enum identity. Reject this duplication.

### Ownership and dependency flow

`@showtime/users/application` → `@showtime/users/domain` → framework-free shared kernel symbols. Existing Nx aliases already provide these entries; no dependency/tag changes are needed. The role enum itself imports no framework or kernel code. User/UserDraft reference the existing UserRole alias, which imports the enum directly. The guard imports the enum directly rather than the value-objects barrel: that barrel re-exports parsers from the domain service, which already depends on the guard.

Raw application inputs → existing domain draft/change-role validation → `isUserRole` → enum-typed immutable record → existing repository/state ports. Equality against Admin/Member narrows accepted strings without normalization, extra mapping, or unsafe casts. Existing events, errors and timestamps remain unchanged. The application public entry explicitly re-exports the domain enum object; it owns no second definition. Existing repository/state/driving ports remain unchanged; no adapter is added.

The `enums/user-role/` folder follows the existing domain enum layout. Register the new member in an enum group barrel if required by the established barrel conventions, without redirecting the guard through a cyclic barrel. Colocated enum/guard tests cover the runtime contract; strict type checks prove the intentional assignment break, and a public-entry test proves domain/application enum identity.

- [Compile-time breaking change] → Declare it in proposal/commit; migrate domain and application atomically since application tests compile domain source.
- [Conflicting unarchived deltas] → This delta adds the enum contract to users-domain, which is not in main specs yet. Preserve older general closed-set scenarios and reconcile exact overlapping artifacts at a future explicitly authorized archive.
- [Barrel cycle] → Keep direct imports where the broader value-objects barrel re-exports domain service parsers.

## Migration Plan

One bounded implementation task includes the enum, guard/type alias, public exports, all consumer updates, tests and narrow documentation alignment. Run uncached domain/application lint/tests, strict spec compilation, and boundary regression checks. Final verification includes affected lint/test/build targets for public API changes, excluding empty shell:test and internal harness-only test-build targets as already documented. No release, push or archive. Rollback reverts the task commit.

## Decisions

- [ADR-0001](../../../docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md): retain inward dependencies and the existing Users layer/scope boundaries.
- [ADR-0002](../../../docs/adr/0002-framework-free-shared-kernel.md): keep the Users-owned role out of shared kernel and preserve symbol-level domain purity. Its final role-union sentence needs the approved narrow role-enum alignment; UserStatus remains a union.
- [ADR-0003](../../../docs/adr/0003-users-model-and-application-ports.md): Users models and public application boundary; align the role representation with this user decision if the text conflicts.
