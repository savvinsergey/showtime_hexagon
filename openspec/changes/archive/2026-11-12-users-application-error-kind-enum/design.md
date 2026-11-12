# Design

## Context

See proposal.md for motivation. UsersError currently declares six string discriminants in `libs/users/application/src/lib/models/users-error/users-error.ts`. Its validation mapper uses `Extract<UsersError, { kind: 'validation' }>`; the repository mock constructs not-found failures. Typed use-case and facade tests construct errors with raw strings and test parameter tables. The application barrel exports UsersError but no error-kind enum.

The base `users-domain-application` implementation is complete but unarchived. Keep its artifacts untouched; this additive delta uses the established users-application capability path. The base error contract remains semantically valid because serialized kind values do not change. This change requires the base implementation and is shipped after it; no automatic archive or spec sync is part of implementation.

## Goals / Non-Goals

**Goals:** one application-owned enum for all currently observed kind discriminants; complete in-repository TypeScript migration with unchanged runtime failures.

**Non-Goals:** shared/global error enums, domain/kernel changes, new error variants, new ports/adapters or compatibility casts that allow old string constructors.

## Approach

Create `src/lib/enums/users-error-kind/users-error-kind.enum.ts` and its colocated `.enum.spec.ts`. Use a regular string enum with members Validation, NotFound, Conflict, Forbidden, Network, Unknown. Preserve the exact six current values. Export it from `@showtime/users/application`; internal consumers use relative imports. This follows the existing OperationStatusEnum naming/layout while keeping context-specific errors out of kernel.

Use each enum member directly in its UsersError variant, preserving the discriminated union and all optional payload fields. Migrate the validation mapper return type and constructed error, repository mock, typed fixtures, parameter tables and comparisons. Replace literal kinds in application error fixtures/assertions consistently; retain independent literal expectations in enum serialization tests to catch accidental value changes. Invalid raw strings remain only in explicit negative type tests.

The data flow stays domain error -> application mapper -> UsersError -> result/facade status, or repository mock -> UsersError -> use-case -> facade. There are no changes to ports, promises, signals, reload behavior or error propagation.

Update engineering conventions with the narrow user-approved UsersErrorKindEnum exception and application enums location; do not enable enums for domain roles/statuses generally. Add JSDoc for the public enum and members. No generator is needed for these files; no dependency, project, layer or ADR is introduced.

## Risks / Trade-offs

- [Source compatibility] -> raw supported strings are no longer assignable; migrate every typed constructor and document enum member replacements. Use the breaking conventional-commit marker/footer for the affected users-application API; do not create versions or tags.
- [Lost narrowing through broad enum types] -> retain separate member discriminants and strict type assertions for fieldIssues/cause; do not replace the union with a single object containing the whole enum.
- [Missed typed fixtures] -> run application lint/tests and strict spec type checking, including all six variants and negative assignments.
- [Two active changes share a capability] -> add uniquely named requirements only; the base can be synchronized before this additive delta when the user later authorizes archive. Neither is archived now.

## Migration Plan

Implement enum, model, public export, producers and tests atomically in one application task so no intermediate commit breaks compilation. Update the conventions exception in that task. Run `npx nx lint users-application` and `npx nx test users-application`; verify that this runner checks negative type assertions, or additionally run the project's strict spec TypeScript check when needed. Final affected verification covers the changed application public API; exclude the documented pre-existing empty shell:test. Build only if the affected graph has an applicable build target, not the internal test-build harness.

Rollback reverts the enum migration as a unit; runtime values do not require a data migration.

## Decisions

- [ADR-0003](../../../docs/adr/0003-users-model-and-application-ports.md): application owns the Users error model and public contracts; enum stays in application.
