# users-domain Specification

## Purpose

Defines the structural identity of a user as plain serializable data, so every users layer shares one model, validates input shape on the client, and records named state changes as events without duplicating backend business rules.

## Requirements

### Requirement: User is immutable plain data
The domain SHALL expose a `User` as a frozen plain record with `id`, `email`, `fullName`, `role` and `status`. It SHALL NOT be a class instance.

#### Scenario: User serializes without wrappers
- **WHEN** a valid `User` is converted to JSON and back
- **THEN** the payload is the same plain object (no class name or extra wrapper)

#### Scenario: User fields are not mutated in place
- **WHEN** a caller attempts to assign a new `status` on an existing `User` object
- **THEN** the assignment does not change the original record (the type is readonly)

### Requirement: Draft has no identifier
Until the backend assigns an id, the domain SHALL represent a validated user as `UserDraft`: the same fields as `User` except `id`.

#### Scenario: Draft omits id
- **WHEN** a valid draft is created from raw input
- **THEN** the draft has `email`, `fullName`, `role` and `status` and has no `id`

### Requirement: Email rejects invalid input
An email SHALL be accepted only when it is a non-empty trimmed string that contains `@` and a domain part. Failure SHALL be a `DomainError` with a stable code.

#### Scenario: Valid email is accepted
- **WHEN** the raw value `ada@example.com` is parsed as an email
- **THEN** the result is success and the stored value is `ada@example.com`

#### Scenario: Empty email is rejected
- **WHEN** the raw value is empty or only whitespace
- **THEN** the result is a domain error with code `invalid-email`

#### Scenario: Email without at-sign is rejected
- **WHEN** the raw value is `not-an-email`
- **THEN** the result is a domain error with code `invalid-email`

### Requirement: Full name rejects empty input
A full name SHALL be accepted only when it is a non-empty trimmed string. Failure SHALL be a `DomainError` with a stable code.

#### Scenario: Valid full name is accepted
- **WHEN** the raw value `Ada Lovelace` is parsed as a full name
- **THEN** the result is success and the stored value is `Ada Lovelace`

#### Scenario: Empty full name is rejected
- **WHEN** the raw value is empty or only whitespace
- **THEN** the result is a domain error with code `invalid-full-name`

### Requirement: Identifier is branded without validation
A user id SHALL be a branded string with no format check in the domain. Mixing it with another entity's id SHALL fail at compile time.

#### Scenario: Id stays a plain string
- **WHEN** a user id is serialized to JSON
- **THEN** the output is the same string without a wrapper

#### Scenario: Foreign id is not assignable
- **WHEN** an id branded for another entity is assigned to a user id
- **THEN** type checking fails

### Requirement: Role and status are closed sets
`role` SHALL be one of `admin` or `member`. `status` SHALL be one of `active` or `inactive`. Unknown strings SHALL NOT become domain values.

#### Scenario: Known role is accepted
- **WHEN** a draft is built with role `admin`
- **THEN** the draft's role is `admin`

#### Scenario: Unknown role is rejected
- **WHEN** a draft is built with role `superuser`
- **THEN** the result is a domain error with code `invalid-role`

#### Scenario: Unknown status is not a domain value
- **WHEN** a caller treats the string `pending` as a user status
- **THEN** type checking fails (status is only `active` or `inactive`)

### Requirement: Draft is built from raw input
Given raw `email`, `fullName` and `role`, the domain SHALL return a `Result` of `UserDraft` with `status` `active`, or a domain error. Draft creation SHALL NOT require a time argument or read a clock.

#### Scenario: Valid input becomes an active draft
- **WHEN** valid email, full name and role `member` are submitted
- **THEN** the result is a draft with those values, `status` `active`, and no `id`

#### Scenario: Invalid input does not produce a draft
- **WHEN** the email is invalid and the other fields are valid
- **THEN** the result is a domain error and no draft is returned

#### Scenario: Draft creation does not require time
- **WHEN** valid raw input is submitted without a time argument
- **THEN** draft creation succeeds without reading system time (the domain does not call `Date` or a clock)

### Requirement: Named transitions return a new user and events
`activate`, `deactivate`, `rename` and `changeRole` SHALL return a new `User` (or a `Result` when the new value can fail) plus domain events. They SHALL NOT call I/O or change the original record.

#### Scenario: Deactivate sets inactive and emits an event
- **WHEN** an active user is deactivated with a given time
- **THEN** the returned user has `status` `inactive`, the original record is unchanged, and a `UserDeactivated` event carries that user's id and the given time

#### Scenario: Activate sets active and emits an event
- **WHEN** an inactive user is activated with a given time
- **THEN** the returned user has `status` `active` and a `UserActivated` event carries that user's id and the given time

#### Scenario: Rename with a valid name succeeds
- **WHEN** a user is renamed to `Grace Hopper` with a given time
- **THEN** the returned user has that full name and a `UserRenamed` event carries the id and time

#### Scenario: Rename with an empty name fails
- **WHEN** a user is renamed to an empty string
- **THEN** the result is a domain error with code `invalid-full-name` and no event

#### Scenario: Change role with a known role succeeds
- **WHEN** a member is given role `admin` with a given time
- **THEN** the returned user has role `admin` and a `UserRoleChanged` event carries the id and time

#### Scenario: Change role with an unknown role fails
- **WHEN** a user is given role `superuser`
- **THEN** the result is a domain error with code `invalid-role` and no event

### Requirement: Registration event requires an id
After a user exists with an id, the domain SHALL produce a `UserRegistered` event from that `User` and a time. It SHALL NOT invent an id.

#### Scenario: Registered event uses the user's id
- **WHEN** `userRegistered` is called with a `User` that has id `u-1` and a given time
- **THEN** the event type identifies registration, `occurredAt` is that time, and the payload includes `u-1`

### Requirement: Domain stays framework-free
The users domain library SHALL NOT import Angular or RxJS. Its graph SHALL list only the shared kernel among workspace libraries.

#### Scenario: Angular import in domain is rejected
- **WHEN** the domain library imports from `@angular/core`
- **THEN** lint reports a restricted import error

#### Scenario: Domain depends only on kernel
- **WHEN** the project graph lists dependencies of the users domain project
- **THEN** the only workspace dependency is `shared-kernel`

### Requirement: User roles have one public enum contract
The domain SHALL export `UserRoleEnum` with `Admin` and `Member` members serialized as `admin` and `member`. The public `UserRole` type SHALL reference that enum. Typed user records SHALL require enum members. Application SHALL expose the enum for consumers of its User model without requiring a domain import.

#### Scenario: Role enum preserves wire values
- **WHEN** a consumer imports the enum through the domain or application public entry and serializes its members
- **THEN** both entries expose the same enum with exactly `Admin = admin` and `Member = member`

#### Scenario: Typed users require role enum members
- **WHEN** a typed user or draft is constructed
- **THEN** enum role members are accepted and raw string assignments to the role field fail type checking

### Requirement: Raw role validation remains compatible
Raw role inputs SHALL remain strings. The role guard and domain transitions SHALL accept only `admin` and `member`, narrow valid inputs to the role enum, and reject unsupported values without changing successful state or event behavior.

#### Scenario: Raw supported roles still validate
- **WHEN** the guard, draft creation or change-role transition receives raw `admin` or `member`
- **THEN** validation succeeds and the resulting role equals the corresponding enum member

#### Scenario: Invalid roles remain rejected
- **WHEN** validation receives an empty role, whitespace or `superuser`, or the guard receives a non-string value
- **THEN** the guard returns false and domain operations with invalid strings return `invalid-role` without a successful model or event

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
