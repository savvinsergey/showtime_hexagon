# Spec Delta

## Purpose

Defines public users application contracts for operations, adapters and their transport-independent failures. This delta adds enum-backed error kinds to the existing implemented application contracts.

## ADDED Requirements

### Requirement: Application exports one error-kind enum
The application SHALL export `UsersErrorKindEnum` from `@showtime/users/application` with exactly Validation, NotFound, Conflict, Forbidden, Network and Unknown, valued `validation`, `not-found`, `conflict`, `forbidden`, `network` and `unknown` respectively. These kinds SHALL have one authoritative enum definition owned by application.

#### Scenario: Consumer imports all error kinds
- **WHEN** a consumer imports UsersErrorKindEnum from the application public entry
- **THEN** all six members are available with exactly the existing string values

### Requirement: Error models use enum discriminants
Every UsersError variant SHALL use its corresponding UsersErrorKindEnum member as its kind. Typed callers SHALL construct errors with enum members. Discriminant narrowing SHALL retain validation field issues and unknown cause typing; unsupported kinds SHALL be rejected.

#### Scenario: Enum members construct all error variants
- **WHEN** a typed caller constructs each UsersError variant with its enum member and message
- **THEN** all six variants compile and preserve their supplied payloads

#### Scenario: Unsupported and raw kinds are rejected
- **WHEN** a caller assigns an unsupported kind, an empty kind, or a raw supported string to UsersError.kind
- **THEN** TypeScript rejects the assignment

#### Scenario: Validation narrowing retains field issues
- **WHEN** a caller narrows an error to UsersErrorKindEnum.Validation
- **THEN** optional email, fullName and role field issues remain available with their existing types

#### Scenario: Unknown narrowing retains optional cause
- **WHEN** a caller narrows an error to UsersErrorKindEnum.Unknown
- **THEN** cause retains type unknown and may be present or absent

### Requirement: Enum migration preserves failure behavior
Replacing string discriminants SHALL preserve existing validation, not-found and repository failure outcomes, messages, field issues and diagnostic causes. Serialized error kinds SHALL remain the original strings.

#### Scenario: Error serialization is unchanged
- **WHEN** an enum-backed error of any of the six kinds is serialized and parsed
- **THEN** its kind equals the original lowercase string and its serializable payload fields remain unchanged

#### Scenario: Validation and missing-user results are preserved
- **WHEN** invalid input is mapped to an application error or a repository mock cannot find a user
- **THEN** the result retains the existing validation or not-found kind value and corresponding message and field issues

#### Scenario: Repository failures retain details
- **WHEN** a repository failure passes through a users use-case and facade
- **THEN** its enum kind, message and applicable diagnostic cause are preserved in the failed result and operation error status
