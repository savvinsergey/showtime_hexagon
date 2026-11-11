# Spec Delta

## ADDED Requirements

### Requirement: Kernel provides context-neutral error kinds
The kernel SHALL export one framework-free ErrorKindEnum from `@showtime/shared/kernel`. Members SHALL be Validation, NotFound, Conflict, Forbidden, Network and Unknown, retaining values `validation`, `not-found`, `conflict`, `forbidden`, `network` and `unknown`. The enum SHALL not depend on Users or any other context.

#### Scenario: Shared error kinds retain their values
- **WHEN** a caller imports ErrorKindEnum from the kernel public entry
- **THEN** exactly the six specified members and string values are available

#### Scenario: Shared classification remains pure
- **WHEN** the transitive dependencies of the ErrorKindEnum export are inspected
- **THEN** no Angular, RxJS, application model or other workspace project is reachable

#### Scenario: Unrelated callers share the classification
- **WHEN** two unrelated error types use ErrorKindEnum members with different payloads
- **THEN** both compile without depending on UsersError or sharing their payload types
