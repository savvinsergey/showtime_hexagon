# Spec Delta

## Purpose

Defines the only public API of the users use-case layer: one driving port for screens, driven-port contracts for adapters, a unified error and operation-status model, and port mocks so tests never import infrastructure.

## ADDED Requirements

### Requirement: One driving port is the public API
Callers SHALL reach users operations only through `UsersApplicationPort` (`USERS_APPLICATION`). Commands SHALL be `load`, `get`, `create`, `update` and `deactivate`. Reads SHALL expose `users`, `total` and `listStatus`. Use-cases SHALL NOT be part of the public barrel.

#### Scenario: Commands and reads share one token
- **WHEN** a caller injects `USERS_APPLICATION`
- **THEN** the same object exposes the five commands plus `users`, `total` and `listStatus`

#### Scenario: Use-cases are not exported
- **WHEN** a consumer imports from `@showtime/users/application`
- **THEN** the barrel exports the driving port, token, application models, `provideUsersApplication` and type `User`, and does not export use-case classes

### Requirement: Each command returns a use-case call
Every command SHALL return `{ status, result }` where `status` is a signal of `idle | loading | success | error | cancelled` (with `UsersError` on error) and `result` is a promise of `Result<T, UsersError>`. `status` SHALL go to `loading` at start, then `success` or `error` from the use-case outcome.

#### Scenario: Successful create reports success
- **WHEN** `create` is called with valid input and the repository succeeds
- **THEN** `status` becomes `loading` then `success`, and `result` is an ok `User`

#### Scenario: Failed create reports error
- **WHEN** `create` is called and the repository returns a conflict
- **THEN** `status` becomes `loading` then `error` with kind `conflict`, and `result` is a failed `Result`

#### Scenario: Result is not used to derive loading
- **WHEN** a caller reads whether a command is in progress
- **THEN** it uses `call.status`, not the unresolved `result` promise

### Requirement: Domain errors become validation errors
When the domain rejects input, the application SHALL map that `DomainError` to `UsersError` kind `validation` (with field issues when known). It SHALL NOT leak domain error objects through the driving port.

#### Scenario: Invalid email on create is validation
- **WHEN** `create` is called with an invalid email
- **THEN** `result` is a failed `UsersError` of kind `validation` and the repository is not called

#### Scenario: Invalid rename is validation
- **WHEN** `update` is asked to set an empty full name
- **THEN** `result` is a failed `UsersError` of kind `validation`

### Requirement: UsersError covers transport kinds
`UsersError` SHALL be a discriminated union by `kind`: `validation`, `not-found`, `conflict`, `forbidden`, `network`, `unknown`. Driven ports SHALL return `Result<T, UsersError>` and SHALL NOT throw.

#### Scenario: Not-found is reported as kind
- **WHEN** `get` is called for a missing id and the repository returns not-found
- **THEN** `result` is a failed `UsersError` of kind `not-found`

#### Scenario: Unknown kind has an optional cause
- **WHEN** the repository returns kind `unknown` with a cause
- **THEN** the failed result exposes that kind and the cause

### Requirement: Repository port covers list and mutations
`UserRepositoryPort` (`USER_REPOSITORY`) SHALL offer `findAll(query)`, `findById(id)`, `create(draft)` and `save(user)`, each returning `Promise<Result<T, UsersError>>`. It SHALL NOT offer `remove` in this change.

#### Scenario: Create takes a draft and returns a user with id
- **WHEN** `create` is called with a valid `UserDraft`
- **THEN** a success result carries a `User` that has an `id`

#### Scenario: Remove is not on the port
- **WHEN** the repository port type is inspected
- **THEN** it has no `remove` method

### Requirement: State port holds the last page only
`UsersStatePort` (`USERS_STATE`) SHALL expose `users` and `total` as Angular `Signal`s and a synchronous `setPage(users, total)`. It SHALL NOT hold query, selection, dialogs or operation status, and SHALL NOT return `Observable` or `Promise`.

#### Scenario: Set page replaces the list
- **WHEN** `setPage` is called with two users and total `2`
- **THEN** `users()` is those two records and `total()` is `2`

#### Scenario: Query is not on the state port
- **WHEN** the state port type is inspected
- **THEN** it has no query, selected id, or status fields

### Requirement: List reloads after a successful mutation
After a successful `create`, `update` or `deactivate`, the application SHALL reload the list with the last `UsersQuery` that was loaded and write the new page through the state port. `listStatus` SHALL track that reload.

#### Scenario: Create reloads the last page
- **WHEN** `load` was called with a query, then `create` succeeds
- **THEN** `findAll` is called again with that same query and `users` reflects the new page

#### Scenario: Update reloads the last page
- **WHEN** `load` was called with a query, then `update` succeeds
- **THEN** `findAll` is called again with that same query

#### Scenario: Deactivate reloads the last page
- **WHEN** `load` was called with a query, then `deactivate` succeeds
- **THEN** `findAll` is called again with that same query

#### Scenario: Failed create does not reload
- **WHEN** `create` fails
- **THEN** `findAll` is not called again after the failure

### Requirement: Latest list request wins
If a newer `load` starts while an older one is in flight, the older call SHALL become `cancelled`, SHALL NOT write state, and the newer success SHALL write `setPage`.

#### Scenario: Stale load is cancelled
- **WHEN** `load` A is started and `load` B is started before A finishes, then A finishes
- **THEN** A's `status` is `cancelled`, `setPage` is not called for A, and B's page is stored

### Requirement: Application re-exports User
Consumers of the driving port SHALL import `User` from `@showtime/users/application`, not from the domain library.

#### Scenario: User type is exported from application
- **WHEN** a caller imports type `User` from `@showtime/users/application`
- **THEN** the import resolves and is the domain `User` type

### Requirement: Clock is injected in application
Application code that needs the current time SHALL inject a `CLOCK` token whose value implements the kernel `Clock`. Domain functions SHALL receive `now` as an argument. The token SHALL default to the system clock.

#### Scenario: System clock is the default
- **WHEN** `CLOCK` is injected with no test override
- **THEN** `now()` returns a valid ISO-8601 UTC string

#### Scenario: Tests can fix the clock
- **WHEN** a test provides `CLOCK` with a fixed clock set to `2026-01-31T10:15:30.000Z`
- **THEN** every `now()` in that test returns that timestamp

### Requirement: Port mocks live in a separate entry
`@showtime/users/application/mock` SHALL provide in-memory fakes of both driven ports, `provideUsersPortsMock()`, and shared contract suites. Production application code SHALL NOT import that entry. Specs and `mock/` folders MAY.

#### Scenario: Spec can provide mocks
- **WHEN** an application spec calls `provideUsersPortsMock()`
- **THEN** `USER_REPOSITORY` and `USERS_STATE` resolve to in-memory fakes

#### Scenario: Production file cannot import mocks
- **WHEN** a non-spec application source file imports `@showtime/users/application/mock`
- **THEN** lint reports a restricted import error

### Requirement: Application does not import infrastructure
The application library SHALL depend on domain and kernel only among workspace libraries. It SHALL NOT import `infrastructure`.

#### Scenario: Application graph excludes infrastructure
- **WHEN** the project graph lists dependencies of the users application project
- **THEN** workspace dependencies are `users-domain` and `shared-kernel` only

#### Scenario: Temporary infrastructure import fails lint
- **WHEN** application source imports `@showtime/users/infrastructure/api`
- **THEN** lint reports a module boundary error
