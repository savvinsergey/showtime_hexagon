# Proposal

## Why

The workspace now enforces layer tags, `depConstraints`, shared kernel primitives with framework-free domain dependencies and shared presentational UI, but the `users` bounded context still has no domain or application libraries. Later infrastructure, feature and the remote app cannot bind ports or reuse one `User` model until those layers exist.

## What Changes

- Add `libs/users/domain` (`@showtime/users/domain`): anemic immutable `User` / `UserDraft`, branded value types, one `UsersDomainService` of pure functions, validation errors and domain events.
- Add `libs/users/application` (`@showtime/users/application`): driving port `UsersApplicationPort`, driven ports `UserRepositoryPort` and `UsersStatePort`, application models (`NewUser`, `UsersQuery`, `UsersPage`, `UsersError`), use-cases, `UsersApplicationService` facade, `provideUsersApplication()`, and Users operations typed with shared contracts specialized to `UsersError`.
- Add a separate entry `@showtime/users/application/mock` with port mocks and contract suites for application tests (application never imports infrastructure).
- Register path aliases and Nx tags (`type:domain` / `type:application`, `scope:users`); domain lint uses `pureConventions`, application lint uses `conventions`.

- Consolidate kernel definitions under `types/`, `tokens/` and `constants/`, with one named folder and colocated tests per entity. Expose all contracts and `CLOCK` through the single `@showtime/shared/kernel` entry; enforce framework-free domain imports per symbol.
- Align workspace lint, rules, examples and owned components with Angular 22 default change detection. Preserve intentional strategy overrides.

## Capabilities

### New Capabilities

- `users-domain`: structural identity of a user (plain model, value types, named transitions, domain events) shared by every later users layer.
- `users-application`: the only public API of the users use-case layer (driving port, errors, statuses, driven-port contracts and test mocks).

### Modified Capabilities

- `shared-kernel`: provide one public entry with symbol-level purity boundaries and shared generic operation contracts.
- `workspace-boundaries`: enforce transitive purity at imported-symbol level and permit owned components to use Angular 22 default change detection.

## Impact

- New Nx projects: `users-domain`, `users-application`.
- Affected files: `tsconfig.base.json` (aliases), generated `project.json` / eslint configs under `libs/users/`.
- Owned Angular components in shell, layout and shared UI adopt the framework default where they explicitly selected OnPush.

## Out of scope

- `libs/users/infrastructure/{api,state}`, `libs/users/ui`, `libs/users/feature`, `apps/users`, shell routing and native federation.
- `libs/shared/event-bus`, `libs/users/contracts`, publishing on a bus: created only with the first real subscriber. Domain events are returned from the domain service; use-cases do not publish yet.
- Repository `remove`, command bus, `SearchField` / `Pagination` / `DataTable`, `libs/shared/util`.
- Predicates such as `canDeactivate` and uniqueness/permission rules (backend is the source of truth).

## Breaking changes

The existing `@showtime/shared/kernel` path supplies pure primitives and Angular application contracts. Remove the former secondary Angular alias and migrate its consumers to this single entry. Framework-free consumers use named pure symbols only.
