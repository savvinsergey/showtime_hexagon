# shared-kernel Specification

## Purpose
Provides framework-free domain primitives (results, errors, identifiers, events, time) that every bounded context shares, so domains do not reinvent them or depend on each other.

## Requirements

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
Framework-free kernel symbols SHALL have no transitive Angular, RxJS or other project dependencies. The single public entry MAY additionally expose explicitly allowed Angular-core integrations: tokens, the call contract and the operation runner. Pure consumers SHALL NOT import Angular-dependent symbols, directly or through intermediary re-exports. RxJS and dependencies on other projects remain forbidden throughout kernel.

#### Scenario: Kernel dependencies are empty
- **WHEN** the project graph lists dependencies of the kernel project
- **THEN** there are no workspace dependencies; framework-free exports have no transitive framework dependencies, and Angular core is confined to the explicitly allowed integrations

#### Scenario: Pure consumer cannot import the runner
- **WHEN** domain or a framework-free kernel source imports or re-exports the operation runner directly or through an intermediary
- **THEN** lint rejects the dependency while existing pure kernel exports remain usable

### Requirement: Applications share generic operation contracts
The kernel SHALL expose the pure string enum `OperationStatusEnum` with `Idle = 'idle'`, `Loading = 'loading'`, `Success = 'success'`, `Error = 'error'` and `Cancelled = 'cancelled'` from `enums/operation-status/operation-status.enum.ts`. `OperationStatus<E>` SHALL remain a pure discriminated union using those enum members and requiring `error: E` only for the error variant. The same public entry SHALL expose `UseCaseCall<T, E>` and one root-provided `CLOCK` token. Each contract SHALL have one authoritative definition in its named folder under its purpose group (`types/`, `enums/`, `tokens/` or `constants/`), with colocated tests.

#### Scenario: Generic errors stay with their consumer
- **WHEN** two callers instantiate the shared contracts with different error types
- **THEN** each status signal and promised result preserve their caller's error type without importing Users

#### Scenario: Lifecycle enum preserves serialized statuses
- **WHEN** a caller constructs operation statuses with `OperationStatusEnum`
- **THEN** their runtime values remain `idle`, `loading`, `success`, `error` and `cancelled`
- **AND** the error variant requires the caller's error payload while other variants do not expose one

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

### Requirement: Operation calls have independent typed lifecycles
The kernel SHALL expose a generic operation runner returning the shared call contract with a read-only status signal and promised Result. It SHALL start execution immediately with Loading, then set Success or Error from the resolved Result without replacing the result or error payload. Each invocation SHALL own its status.

#### Scenario: Runner succeeds with the original result
- **WHEN** an operation resolves successfully
- **THEN** its call starts at Loading, finishes at Success and returns the identical Result object

#### Scenario: Runner preserves typed errors
- **WHEN** operations using two unrelated error types resolve with failures
- **THEN** each call finishes at Error carrying its own original error payload and returns its original Result with correct compile-time types

#### Scenario: Concurrent calls stay independent
- **WHEN** two calls complete in reverse order
- **THEN** completing either call does not change the other's status or result

### Requirement: Success hooks run after completion status
The runner SHALL accept an optional synchronous success hook receiving the successful value. It SHALL run once after Success is set and before the result promise fulfills, and SHALL NOT run on a failure. It SHALL NOT await background reloads. Unexpected throws/rejections SHALL propagate without inventing context errors.

#### Scenario: Hook observes success before result delivery
- **WHEN** a successful operation has a hook
- **THEN** the hook receives its value once, observes Success and runs before the caller's result continuation

#### Scenario: Failed operation skips hook
- **WHEN** an operation resolves with a failed Result
- **THEN** its hook is not called

#### Scenario: Unexpected exceptions retain existing semantics
- **WHEN** execution throws or rejects, or a synchronous success hook throws
- **THEN** the result promise rejects with the same exception; execution failure leaves Loading and hook failure leaves Success without synthesizing an error payload

### Requirement: Users orchestration remains context-owned
Users SHALL use the runner for get/create/update/deactivate while retaining query memory, automatic reload policy, list state writes and latest-load arbitration in its facade. Successful persistence SHALL remain successful independently of reload failures. Existing driving-port signatures SHALL remain unchanged.

#### Scenario: Users mutation reload behavior is preserved
- **WHEN** a mutation succeeds after a page query was loaded
- **THEN** its call reaches Success and starts a reload of the latest remembered query; failed mutations and mutations before any load do not reload

#### Scenario: Read and race behavior is preserved
- **WHEN** a user lookup runs or a list request is superseded
- **THEN** lookup does not reload the page, and the superseded list call is Cancelled and cannot replace the latest page or list status

#### Scenario: Reload failure does not undo persistence
- **WHEN** a successful mutation's automatic reload fails
- **THEN** mutation status/result stay successful while listStatus reports the reload error
