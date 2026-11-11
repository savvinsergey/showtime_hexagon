# Proposal

## Why

The six existing application error categories are context-neutral. A kernel-owned ErrorKindEnum lets contexts share this vocabulary without importing Users, while each context continues to own its error payload and handling.

## What Changes

- Move and rename UsersErrorKindEnum to `ErrorKindEnum` in kernel, retaining all six members and string values.
- Export ErrorKindEnum through `@showtime/shared/kernel`; application re-exports the same definition for its consumers.
- Migrate UsersError, producers, mocks and tests; remove the old Users enum definition and export.
- Align conventions and ADR guidance: the classification is shared, UsersError and its fields remain application-owned.
- **BREAKING**: replace UsersErrorKindEnum imports and member references with ErrorKindEnum.

## Capabilities

### New Capabilities

- `users-application`: add shared error classification consumption. This capability exists in completed unarchived changes, not main specs; retain its established path and introduce only new requirements here.

### Modified Capabilities

- `shared-kernel`: expose a context-neutral, framework-free error category enum.

## Impact

Nx projects `shared-kernel` and `users-application`; kernel enum/public entry, Users error types, consumers and tests, conventions and relevant ADRs. No dependencies or projects added. Existing user changes to application service/barrels must be preserved.

## Out of scope

A generic Error model/base class, moving UsersError or fieldIssues into kernel, new error categories, domain role/status migration, error-handling changes, UI/adapters, release or archive operations.

## Breaking changes

`users-application`: remove UsersErrorKindEnum in favor of ErrorKindEnum. `shared-kernel` gains an export. Serialized values and payloads stay unchanged; no compatibility alias under the old name is planned.
