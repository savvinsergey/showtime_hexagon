# Spec Delta

## Purpose

Defines public users application contracts for operations and transport-independent failures. This delta makes Users consume the shared kernel error classification while retaining its own error payloads.

## ADDED Requirements

### Requirement: Users uses the shared error classification
UsersError SHALL use ErrorKindEnum members from kernel as discriminants. The application public entry SHALL re-export that same enum definition as ErrorKindEnum. The old UsersErrorKindEnum name and context-owned definition SHALL be removed. Context-specific messages, fieldIssues and optional cause SHALL remain owned by Users.

#### Scenario: Application exposes the kernel enum identity
- **WHEN** a consumer imports ErrorKindEnum through application and kernel
- **THEN** both refer to the same enum object and UsersError accepts its members

#### Scenario: Old enum name is removed
- **WHEN** a TypeScript caller imports UsersErrorKindEnum from application
- **THEN** compilation fails and the migration is to ErrorKindEnum

#### Scenario: Users error payloads still narrow
- **WHEN** UsersError is narrowed by ErrorKindEnum.Validation or ErrorKindEnum.Unknown
- **THEN** validation fieldIssues and optional unknown cause retain their previous types

#### Scenario: Unsupported error kinds remain rejected
- **WHEN** a caller constructs UsersError with an empty, unsupported or raw string kind
- **THEN** TypeScript rejects the construction

### Requirement: Shared classification preserves Users failure behavior
The enum rename and relocation SHALL preserve serialized error kinds, validation results, mock not-found outcomes, messages and repository failure propagation through Users operations and statuses.

#### Scenario: Users error serialization is unchanged by relocation
- **WHEN** each enum-backed Users error is serialized and parsed
- **THEN** the original lowercase kind and serializable payload fields remain unchanged

#### Scenario: Users failure details survive relocation
- **WHEN** invalid input is mapped, a mock lookup misses a user, or a repository error passes through a use-case and facade
- **THEN** the same failed result and status retain their kind, message, field issues and applicable cause
