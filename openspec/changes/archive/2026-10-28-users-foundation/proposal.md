# Proposal

## Why

The `users` bounded context is built as a hexagonal/DDD set of Nx libraries (domain, application, infrastructure, ui, feature) plus a micro-frontend. Today the workspace has no layer tags, the `@nx/enforce-module-boundaries` rule allows everything (`*` -> `*`), and there are no shared building blocks (domain primitives, reusable dumb UI). Without this foundation the later changes cannot enforce the dependency rule, and each layer would invent its own primitives. This is the first change of a five-change sequence (foundation -> domain + application -> infrastructure -> ui + feature -> micro-frontend).

## What Changes

- Tag existing projects (`shell`, `layout`, `shared-spartan-ui`) with `type:*` and `scope:*` tags; keep `shared-styles` tags as they are.
- Replace the permissive `depConstraints` in `eslint.config.mjs` with layer and scope constraints (domain, application, infrastructure, contracts, feature, ui, util, kernel, app; scopes `shell`, `layout`, `shared`, `users`).
- Add a framework-free lint variant for `type:domain` and `type:kernel` libraries (no `@angular/*`, no `rxjs`).
- Create `libs/shared/kernel` (`@showtime/shared/kernel`): `Result`, `DomainError`, branded `Id`, `DomainEvent`, `Clock` (domain primitives only).
- Create `libs/shared/ui` (`@shared/ui`, selector prefix `st-`): dumb `StatusBadge`, `ConfirmDialog`, `QueryState` built on `@shared/spartan-ui`.
- Register path aliases for the new libraries in `tsconfig.base.json`.
- Make sure new libraries spread the project lint conventions (`conventions` from `eslint.conventions.mjs`), including the `@ngrx/*` and `application/mock` import restrictions.

## Capabilities

### New Capabilities
- `workspace-boundaries`: tag taxonomy and enforced dependency rules between layers and scopes, plus import restrictions that lint must enforce.
- `shared-kernel`: framework-free domain primitives shared by all bounded contexts.
- `shared-ui`: reusable presentational components without domain knowledge.

### Modified Capabilities
<!-- None: there are no existing specs. -->

## Impact

- Affected Nx projects: `shell`, `layout`, `shared-spartan-ui` (tags only), new `shared-kernel`, new `shared-ui`.
- Affected files: `eslint.config.mjs`, `eslint.conventions.mjs`, `tsconfig.base.json`, `project.json` of the tagged projects, `nx.json` only if the generator requires it.
- No runtime behavior change in the running application; lint results may change for code that violates the new constraints (none are expected today).

## Out of scope

- Any `users` library (domain, application, infrastructure, ui, feature), the `apps/users` remote, native federation changes and shell routing (later changes).
- `libs/shared/event-bus`, `contracts`, command bus: created only with the first real subscriber.
- `SearchField`, `Pagination`, `DataTable` in `shared/ui`: moved there only when a second consumer appears.
- `libs/shared/util`: created when the first utility is needed.

## Breaking changes

None. Tags and lint constraints are tooling only; no public API of `shell` or `layout` changes.
