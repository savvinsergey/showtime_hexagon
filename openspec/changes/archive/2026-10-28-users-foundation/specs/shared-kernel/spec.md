# Spec Delta

## Purpose

Provides framework-free domain primitives (results, errors, identifiers, events, time) that every bounded context shares, so domains do not reinvent them or depend on each other.

## ADDED Requirements

### Requirement: Result models success and failure explicitly
The kernel SHALL provide a `Result` that is either a success carrying a value or a failure carrying an error, discriminated by an `ok` flag, with helpers to create each case.

#### Scenario: Successful result carries the value
- **WHEN** a success result is created with a value
- **THEN** `ok` is true and the value is readable without a cast after narrowing

#### Scenario: Failed result carries the error
- **WHEN** a failure result is created with an error
- **THEN** `ok` is false and the error is readable after narrowing

#### Scenario: Result is serializable
- **WHEN** a result is converted to JSON and back
- **THEN** its `ok` flag and payload are preserved

### Requirement: Domain errors have a stable shape
The kernel SHALL provide a `DomainError` shape with a machine-readable `code` and a human-readable `message`, so contexts define their own errors on top of it.

#### Scenario: Error exposes code and message
- **WHEN** a domain error is created with a code and a message
- **THEN** both values are exposed unchanged

### Requirement: Identifiers are branded strings
The kernel SHALL provide a branded identifier type so identifiers of different entities are not interchangeable at compile time while staying plain strings at runtime.

#### Scenario: Identifier stays a plain string at runtime
- **WHEN** a branded identifier is serialized to JSON
- **THEN** the output is the same string without wrappers

#### Scenario: Identifiers of different entities are not interchangeable
- **WHEN** an identifier branded for one entity is assigned to a variable branded for another entity
- **THEN** type checking fails

### Requirement: Domain events share a base shape
The kernel SHALL provide a `DomainEvent` base with a string `type` and an ISO-8601 `occurredAt`, so events are plain immutable data.

#### Scenario: Event is plain data
- **WHEN** a domain event is created
- **THEN** it contains `type` and `occurredAt` and survives JSON serialization unchanged

### Requirement: Time is injectable
The kernel SHALL provide a `Clock` contract returning the current time as an ISO-8601 string, so code that needs the time can be tested with a fixed clock.

#### Scenario: System clock returns ISO time
- **WHEN** the system clock is asked for the current time
- **THEN** the returned value is a valid ISO-8601 string

#### Scenario: Fixed clock returns a constant
- **WHEN** a test uses a fixed clock
- **THEN** every call returns the configured time

### Requirement: Kernel is framework-free
The kernel SHALL NOT depend on Angular, RxJS or any other library project; it is consumable from any layer.

#### Scenario: Kernel dependencies are empty
- **WHEN** the project graph lists dependencies of the kernel project
- **THEN** only npm type-level dependencies of TypeScript itself appear, and no workspace or framework package
