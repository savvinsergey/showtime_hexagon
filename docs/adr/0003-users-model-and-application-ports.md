# ADR-0003: Users plain models and application-owned ports

- Status: Accepted
- Date: 2026-11-03

## Context

The users context needs domain and application libraries before its adapters and screens exist.
ADR-0001 enforces inward layer dependencies; ADR-0002 supplies framework-free primitives.
Later API and state adapters must share one serializable User model without becoming dependencies
of application code. The approved users-domain-application change establishes those contracts.

## Decision Drivers

- Preserve framework-free structural validation and deterministic domain transitions.
- Allow repository and state implementations to be replaced independently.
- Keep screen consumers independent of internal use-case classes.
- Avoid speculative event infrastructure and duplicate model mappings.

## Considered Options

1. A combined Angular domain/application library with class models: fewer projects, but structural
   rules acquire framework dependencies and instances require reconstruction after serialization.
2. Separate pure domain and Angular application libraries with plain models and application-owned
   ports: two projects, but lint can enforce purity and adapters implement stable inward contracts.
3. Expose individual use-case classes directly: simple initial wiring, but consumers become coupled
   to orchestration and operation-status implementation details.

## Decision

Use option 2. Users domain exposes immutable plain User/UserDraft records, branded validated values,
and one stateless service of pure functions. Domain functions receive time explicitly and return
new models and domain events; they do not perform I/O or publish events. Structural validation stays
on the client; uniqueness, permissions and record-dependent rules remain backend responsibilities.

Application owns one driving UsersApplicationPort and repository/state driven ports. Its internal
facade delegates to use-cases and owns per-call statuses, latest-list arbitration and mutation reloads.
State holds page data only. Concrete adapters bind at the composition root, never inside feature or
application. The application barrel exposes consumer models and adapter contracts, while facade and
use-case implementations remain internal. Application re-exports the User type for screen consumers.

The shared kernel owns the generic call/status contracts. Users ports and facade use
`UseCaseCall<T, UsersError>` and `OperationStatus<UsersError>` explicitly. The error union
belongs to Users, including messages, validation field issues and diagnostic causes.
The shared kernel owns `ErrorKindEnum`; UsersError uses its members as discriminants.
Application re-exports that same enum for screen consumers. `UsersErrorKindEnum` and its
application-owned definition are removed; callers migrate to `ErrorKindEnum`.
Application use-cases import the shared `CLOCK` token from
`@showtime/shared/kernel`, so a fixed-clock override applies to each use-case.

Port mocks and reusable contract suites live in application/mock, restricted to test/mock imports.
There is no event bus or integration contract library until a real subscriber requires publishing.

## Consequences

Positive: one model crosses layers unchanged; domain tests need no framework; adapters can be
checked against the same port suites; consumers depend on a small stable driving contract.

Negative: application intentionally depends on Angular Signals/DI, and consumer-facing operation
status coordination belongs to the facade rather than the pure domain.

Risks: the facade can accumulate business logic; keep structural rules in the domain and repository
orchestration in focused internal use-cases. No DTOs or adapter-specific models belong in application.

## Follow-ups

- Implement API and state adapters in users-infrastructure and run the shared port contract suites.
- Bind adapters and application providers in the users composition root when that remote is added.
