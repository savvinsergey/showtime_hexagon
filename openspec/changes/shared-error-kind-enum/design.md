# Design

## Context

UsersErrorKindEnum currently lives in users application and is exported by its public entry. UsersError, the validation mapper, repository mock and tests depend on it. Kernel already has a pure `enums/` group and one public entry. See proposal.md for motivation.

Existing conventions explicitly require application ownership of UsersErrorKindEnum; this user-approved relocation supersedes that narrow decision. Only the classification becomes shared. UsersError, fieldIssues, causes, mapping and application operations stay with Users. A shared enum is requested explicitly even though Users is currently its only production consumer; no speculative contexts are created.

The completed users-domain-application and users-application-error-kind-enum changes remain unarchived. The latter explicitly requires the old name and owner. This new plan intentionally supersedes those requirements. Before any future archive, reconcile that older enum requirement with this migration so stale ownership/name requirements are not retained in main specs. Archive/spec sync is outside this implementation and requires separate user approval.

## Goals / Non-Goals

**Goals:** one pure ErrorKindEnum definition; shared identity across kernel and application exports; unchanged error values and narrowed Users payloads.

**Non-Goals:** generic Error/Result redesign, moving context models to kernel, extra context examples in production, new ports, libraries, dependencies or adapters.

## Approach

Add `libs/shared/kernel/src/lib/enums/error-kind/error-kind.enum.ts` and `.enum.spec.ts`. Preserve Validation, NotFound, Conflict, Forbidden, Network, Unknown and their six existing values. Generalize member JSDoc (a requested resource, not specifically a user). Export from `@showtime/shared/kernel`. No Angular/RxJS or context imports.

Then migrate all Users references to ErrorKindEnum from the kernel public entry, delete the old enum and move its tests as appropriate. The application public entry re-exports the same ErrorKindEnum so screen consumers still depend only on application. Do not retain UsersErrorKindEnum as a compatibility alias or create a second enum. Preserve user edits to service/barrels; update an existing application enums barrel if it references the removed file, leaving unrelated exports intact.

Keep UsersError as its existing discriminated union with ErrorKindEnum member discriminants. Validation mapping, repository failures, signals and statuses retain behavior and payload ownership. Two unrelated test-only error shapes demonstrate that the shared vocabulary does not force shared payload models; they are not new production abstractions.

Update engineering conventions and ADR-0002/ADR-0003 narrowly: shared classification belongs to kernel; context error models remain application-owned. Add a purity regression for the new named kernel export using the existing lint test machinery, not a new resolver. No generator or Nx configuration change is needed.

## Risks / Trade-offs

- [Breaking enum name/import] -> migrate all in-repository consumers in one application task, remove old exports, check negative public-import assertions and use a breaking commit marker/footer. No release or tags.
- [Nominal string-enum identity] -> define only once and re-export, verify runtime identity and exact discriminant types.
- [Kernel gains context coupling] -> pure dependency traversal and tests with unrelated payload types; no Users imports or generic error payload in kernel.
- [User-edited service and barrels] -> record pre-existing diff and preserve it; do not stage unrelated edits. Report a genuine overlapping conflict rather than resetting files.

## Migration Plan

First add the kernel export without changing existing application behavior. Then atomically migrate Users and remove the old enum; each task includes its own tests/docs. Run kernel and application lint/tests through Nx, strict spec checks for compile-time assertions and existing boundary tests. Final affected verification includes real consumers of the kernel export; exclude the pre-existing empty shell:test. Do not run internal test-build targets as standalone builds (they require a test harness). Revert both tasks together to roll back; stored data needs no migration.

## Decisions

- [ADR-0002](../../../docs/adr/0002-framework-free-shared-kernel.md): one kernel entry, purpose-grouped enums and symbol-level purity.
- [ADR-0003](../../../docs/adr/0003-users-model-and-application-ports.md): application owns context error payloads and exposes consumer contracts.
