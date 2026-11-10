# Spec Delta

## MODIFIED Requirements

### Requirement: Kernel is framework-free
The kernel SHALL have one public entry, `@showtime/shared/kernel`, exporting pure primitives and Angular application contracts. Named pure primitives and their transitive dependencies SHALL remain independent of Angular, RxJS and other workspace projects. Domain consumers SHALL use only those pure symbols.

#### Scenario: Kernel dependencies are empty
- **WHEN** the transitive dependencies of named pure exports from the single kernel entry are inspected
- **THEN** they reach no framework package, Angular-dependent implementation or other workspace project

## ADDED Requirements

### Requirement: Applications share generic operation contracts
The kernel SHALL expose `OperationStatus<E>` as a pure type. The same public entry SHALL expose `UseCaseCall<T, E>` and one root-provided `CLOCK` token. Each contract SHALL have one authoritative definition in its named folder under its purpose group (`types/`, `tokens/` or `constants/`), with colocated tests.

#### Scenario: Generic errors stay with their consumer
- **WHEN** two callers instantiate the shared contracts with different error types
- **THEN** each status signal and promised result preserve their caller's error type without importing Users
