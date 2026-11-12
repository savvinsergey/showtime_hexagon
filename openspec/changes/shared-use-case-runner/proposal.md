# Proposal

## Why

Users facade contains reusable code for starting an operation and resolving its status. Extract that lifecycle into the shared kernel so other contexts can use it without depending on Users orchestration.

## What Changes

- Export generic runUseCase<T, E>(execute, onSuccess?) returning the established UseCaseCall<T, E>; keep its resolver private.
- Preserve independent read-only status signals, immediate Loading, exact Result/error forwarding and Success/Error completion.
- Let Users supply its success reload callback; keep latest-query selection, list arbitration and cancellation in the facade.
- Narrowly permit Angular core in the runner and enforce transitive framework boundaries for pure consumers.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `shared-kernel`: generic operation execution and symbol-level framework boundary for its Angular-dependent helper. Reconcile older unarchived kernel deltas at a future explicitly authorized archive.

## Impact

shared-kernel helper/public entry/tests, users-application facade and regression tests, lint boundary configuration/fixtures and narrow engineering/ADR alignment. No new library, port or dependency. Existing Result-producing operations remain one-shot Promise operations; the separate infrastructure resource question is unaffected.

## Breaking changes

None. Existing public Users calls and shared contracts retain their signatures and runtime behavior.

## Out of scope

Generic list state, transport cancellation, Observable/resource migration, error normalization, automatic retries, event publication, archive, push and unrelated working changes.
