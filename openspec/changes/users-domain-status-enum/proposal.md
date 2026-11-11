# Proposal

## Why

User lifecycle values are repeated as string literals. Following the approved role migration, the user wants one domain-owned enum for status and consistent use throughout its consumers.

## What Changes

- Add public `UserStatusEnum.Active = 'active'` and `.Inactive = 'inactive'` under domain enums with JSDoc and tests.
- **BREAKING**: retain UserStatus as an alias to the enum, replacing its string union. Migrate domain transitions, guards, typed fixtures and application consumers to enum members.
- Re-export the same enum through application so feature consumers need no domain import.
- Align the remaining status-union rule/design text; retain raw boundary and JSON compatibility tests.

## Capabilities

### New Capabilities
- `users-domain`: authoritative public status enum contract. Users domain is currently specified in unarchived users-domain-application and users-domain-role-enum; add status requirements here without duplicating their broader contracts, and reconcile these deltas at a future archive.

### Modified Capabilities
None in main specs.

## Impact

users-domain and users-application types, public entries, guards, transitions, fixtures and tests; narrow engineering/design documentation. No new dependency, library or port.

## Breaking changes

users-domain/users-application: constructing typed User/UserDraft records requires enum status members instead of raw literals. Serialized values remain unchanged.

## Out of scope

Role/event/error enums, OperationStatusEnum, permissions, HTTP/resource design, infrastructure implementation, archive, release and unrelated pending edits.
