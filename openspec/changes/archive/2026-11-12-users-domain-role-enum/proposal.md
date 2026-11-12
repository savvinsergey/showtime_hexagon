# Proposal

## Why

Users role values are currently repeated as string literals. The user requested a single domain-owned enum so typed consumers refer to named roles while serialized values stay compatible.

## What Changes

- Define `UserRoleEnum.Admin = 'admin'` and `UserRoleEnum.Member = 'member'` in users/domain/enums, with public export and JSDoc.
- **BREAKING**: make the existing exported `UserRole` type refer to this enum; typed domain records use enum members. Preserve raw string inputs and the `isUserRole` guard.
- Migrate domain/application fixtures and known-role usages together; keep literal wire-value assertions and invalid-input tests.
- Align the narrow enum exception and active design/ADR text that currently mandates a role union.

## Capabilities

### New Capabilities
- `users-domain`: authoritative enum-backed role contract. This capability currently exists only in the unarchived users-domain-application change; this delta adds the specific role contract without duplicating its broader requirements. Reconcile both deltas when archiving later.

### Modified Capabilities
None in the main spec inventory.

## Impact

users-domain public types, guard, enum and tests; users-application consumers/tests and public type re-exports as needed. No new library, port, adapter or dependency.

## Breaking changes

users-domain and users-application: raw string literals are no longer assignable to typed `User.role` / `UserDraft.role`; use enum members. Raw application input models remain strings. JSON values stay `admin` and `member`.

## Out of scope

UserStatus, permissions, infrastructure, HTTP/resource design, event enums, archive, release and unrelated pending workflow changes.
