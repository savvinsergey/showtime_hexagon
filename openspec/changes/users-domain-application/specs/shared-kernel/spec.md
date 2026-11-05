# Spec Delta

## MODIFIED Requirements

### Requirement: Kernel is framework-free
The public `@showtime/shared/kernel` entry SHALL expose only framework-free declarations. Its entire import tree SHALL remain independent of Angular, RxJS and other workspace projects. Angular integration SHALL be isolated behind `@shared/kernel/angular` in the same Nx project.

#### Scenario: Kernel dependencies are empty
- **WHEN** the import tree of the pure kernel entry is inspected
- **THEN** it reaches no framework package, Angular integration file or other workspace project

## ADDED Requirements

### Requirement: Applications share generic operation contracts
The kernel SHALL expose `OperationStatus<E>` as a pure type. The Angular entry SHALL expose the same status type, `UseCaseCall<T, E>` and one root-provided `CLOCK` token. Each contract SHALL have one authoritative definition in its named folder.

#### Scenario: Generic errors stay with their consumer
- **WHEN** two callers instantiate the shared contracts with different error types
- **THEN** each status signal and promised result preserve their caller's error type without importing Users
