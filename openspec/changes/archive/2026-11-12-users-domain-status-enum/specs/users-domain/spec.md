# Spec Delta

## Purpose

Defines stable lifecycle values for immutable Users domain models and the validation contracts used by their consumers.

## ADDED Requirements

### Requirement: User status has one public enum contract
The domain SHALL export UserStatusEnum with Active and Inactive members serialized as `active` and `inactive`. UserStatus SHALL reference that enum. Typed User and UserDraft status fields SHALL require enum members. Application SHALL re-export the same enum for consumers of its User model.

#### Scenario: Status enum preserves serialized values
- **WHEN** a consumer imports the status enum through domain and application public entries
- **THEN** both expose the same enum with exactly Active = `active` and Inactive = `inactive`, including JSON serialization

#### Scenario: Typed models require status enum members
- **WHEN** a caller constructs a typed User or UserDraft
- **THEN** enum status members are accepted and raw `active`, raw `inactive` and unknown strings are rejected by type checking

### Requirement: Status validation and transitions remain compatible
The status guard SHALL recognize raw `active` and `inactive` and narrow them to UserStatus. Draft creation SHALL yield Active; activate/deactivate SHALL yield Active/Inactive respectively while preserving event names, ids, times and original models. Unknown raw values SHALL fail the guard.

#### Scenario: Raw valid statuses narrow to enum
- **WHEN** the guard receives raw `active` or `inactive`
- **THEN** it returns true and narrows the value to the corresponding status enum

#### Scenario: Invalid raw statuses are rejected
- **WHEN** the guard receives `pending`, empty text, whitespace, uppercase text or a non-string value
- **THEN** it returns false

#### Scenario: Lifecycle operations use enum values immutably
- **WHEN** a valid draft is created or a user is activated or deactivated with a fixed time
- **THEN** the resulting status is the appropriate enum member, original user records stay unchanged, and transition events retain their established names, user ids and time
