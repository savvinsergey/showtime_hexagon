# Spec Delta

## MODIFIED Requirements

### Requirement: Kernel is framework-free
Framework-free kernel symbols SHALL have no transitive Angular, RxJS or other project dependencies. The single public entry MAY additionally expose explicitly allowed Angular-core integrations: tokens, the call contract and the operation runner. Pure consumers SHALL NOT import Angular-dependent symbols, directly or through intermediary re-exports. RxJS and dependencies on other projects remain forbidden throughout kernel.

#### Scenario: Kernel dependencies are empty
- **WHEN** the project graph lists dependencies of the kernel project
- **THEN** there are no workspace dependencies; framework-free exports have no transitive framework dependencies, and Angular core is confined to the explicitly allowed integrations

#### Scenario: Pure consumer cannot import the runner
- **WHEN** domain or a framework-free kernel source imports or re-exports the operation runner directly or through an intermediary
- **THEN** lint rejects the dependency while existing pure kernel exports remain usable

## ADDED Requirements

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
