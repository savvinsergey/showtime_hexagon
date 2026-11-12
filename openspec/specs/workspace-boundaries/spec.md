# workspace-boundaries Specification

## Purpose
Defines how workspace projects are classified and which dependencies and imports lint must reject, so architectural layers and bounded contexts stay isolated as libraries are added.

## Requirements

### Requirement: Projects are classified by layer and scope
Every Nx project SHALL carry at least one `type:*` tag (layer) and one `scope:*` tag (owner), and a repository check SHALL fail when a project lacks either. Existing projects SHALL be tagged: `shell` as `type:app` and `scope:shell`, `layout` as `type:ui` and `scope:layout`, `shared-spartan-ui` as `type:ui` and `scope:shared`, `shared-styles` unchanged (`type:util`, `scope:shared`).

#### Scenario: Existing projects are tagged
- **WHEN** the project graph is queried for tags
- **THEN** `shell`, `layout`, `shared-spartan-ui` and `shared-styles` each report their `type:*` and `scope:*` tags

#### Scenario: Untagged project fails the tag check
- **WHEN** a project has no `type:*` tag or no `scope:*` tag
- **THEN** the repository tag check fails and names the project

#### Scenario: Importing an untagged project is rejected
- **WHEN** a tagged library imports a project that has no tags
- **THEN** the module boundaries lint reports an error

### Requirement: Layer dependency rule is enforced
Lint SHALL reject imports that point outward or sideways between layers. Allowed dependencies: `type:domain` -> domain, kernel; `type:application` -> domain, kernel, util, contracts; `type:infrastructure` -> domain, application, kernel, util; `type:feature` -> application, ui, util; `type:ui` -> ui, util; `type:util` -> util; `type:kernel` -> kernel; `type:contracts` -> kernel, contracts; `type:app` -> any layer.

#### Scenario: Domain importing application is rejected
- **WHEN** a `type:domain` library imports a `type:application` library
- **THEN** lint reports a module boundary error

#### Scenario: Feature importing infrastructure is rejected
- **WHEN** a `type:feature` library imports a `type:infrastructure` library
- **THEN** lint reports a module boundary error

#### Scenario: Feature importing domain is rejected
- **WHEN** a `type:feature` library imports a `type:domain` library
- **THEN** lint reports a module boundary error

#### Scenario: Dumb ui importing application is rejected
- **WHEN** a `type:ui` library imports a `type:application` library
- **THEN** lint reports a module boundary error

#### Scenario: Application importing infrastructure is rejected
- **WHEN** a `type:application` library imports a `type:infrastructure` library
- **THEN** lint reports a module boundary error

#### Scenario: Application depends on domain and kernel
- **WHEN** a `type:application` library imports a `type:domain` library and a `type:kernel` library of the same or shared scope
- **THEN** lint reports no module boundary error

### Requirement: Scopes are isolated
Lint SHALL restrict dependencies by scope: `scope:shared` depends only on shared; `scope:layout` on layout and shared; `scope:shell` on shell, layout and shared (never on `scope:users`); `scope:users` on users, shared and `type:contracts` libraries of other scopes.

#### Scenario: Shell importing users is rejected
- **WHEN** a `scope:shell` project imports a `scope:users` library
- **THEN** lint reports a module boundary error

#### Scenario: Users importing another context internals is rejected
- **WHEN** a `scope:users` library imports a non-contracts library of another bounded-context scope
- **THEN** lint reports a module boundary error

#### Scenario: Users importing another context contracts is allowed
- **WHEN** a `scope:users` application library imports a `type:contracts` library of another scope
- **THEN** lint reports no module boundary error

### Requirement: Restricted imports are enforced in source
Lint SHALL reject: any `@ngrx/*` import except `@ngrx/signals` in libraries that use the infrastructure conventions; direct `@spartan-ng/helm/*` imports outside the spartan-ui library; `@showtime/*/application/mock` imports outside `*.spec.ts` files and `mock/` folders; `toSignal`/`toObservable` and reactive/template-driven forms APIs.

#### Scenario: NgRx import in a regular library is rejected
- **WHEN** a library using the default conventions imports from `@ngrx/signals`
- **THEN** lint reports a restricted import error

#### Scenario: NgRx Signals in the state infrastructure library is allowed
- **WHEN** a library using the infrastructure conventions imports from `@ngrx/signals`
- **THEN** lint reports no restricted import error

#### Scenario: Other NgRx packages stay rejected in infrastructure
- **WHEN** a library using the infrastructure conventions imports from `@ngrx/store`
- **THEN** lint reports a restricted import error

#### Scenario: Direct helm import is rejected
- **WHEN** a library imports from `@spartan-ng/helm/button`
- **THEN** lint reports a restricted import error and the barrel `@shared/spartan-ui` is accepted

#### Scenario: Port mocks are importable only from specs
- **WHEN** `@showtime/users/application/mock` is imported from a regular source file
- **THEN** lint reports a restricted import error
- **AND** the same import in a `*.spec.ts` file reports no error

### Requirement: Framework-free layers
Domain and framework-free kernel sources SHALL reject Angular, RxJS and symbols with transitive framework dependencies, including through renamed imports and intermediary re-exports. The single kernel barrel MAY export Angular application contracts. Only kernel tokens, the UseCaseCall contract and the operation runner MAY import Angular core, with core testing helpers allowed in their colocated specs. RxJS SHALL remain forbidden throughout kernel. Lint SHALL enforce the boundaries for type and value imports; namespace imports and export-all from the mixed barrel SHALL be rejected in framework-free sources.

#### Scenario: Angular import in domain is rejected
- **WHEN** a `type:domain` library imports from `@angular/core`
- **THEN** lint reports a restricted import error

#### Scenario: RxJS import in kernel is rejected
- **WHEN** a `type:kernel` library imports from `rxjs`
- **THEN** lint reports a restricted import error

#### Scenario: Domain cannot reach Angular-dependent kernel symbols
- **WHEN** domain source imports CLOCK or UseCaseCall from `@showtime/shared/kernel`, directly or through an intermediary
- **THEN** lint rejects the import even though the kernel project is an allowed dependency

#### Scenario: Pure kernel sources cannot re-export Angular-dependent symbols
- **WHEN** a framework-free kernel implementation re-exports an Angular-dependent symbol through the public barrel or an internal path
- **THEN** lint rejects the dependency

### Requirement: New libraries use the project lint conventions
Every new application or library lint configuration SHALL spread the project conventions (default or the variant matching its layer), so restricted imports apply from the first commit.

#### Scenario: New library inherits conventions
- **WHEN** a new library is generated and linted with a forbidden import
- **THEN** lint reports the restricted import error without extra configuration

### Requirement: Owned components use Angular 22 default change detection
Owned components SHALL use Angular 22’s implicit OnPush strategy unless they explicitly require a different strategy. Workspace lint and engineering guidance SHALL allow the default and intentional overrides.

#### Scenario: Owned component omits redundant metadata
- **WHEN** an owned component relies on the default strategy
- **THEN** it passes change-detection lint without a strategy declaration

#### Scenario: Explicit strategy override is preserved
- **WHEN** an owned component explicitly requires a non-default strategy
- **THEN** it retains that choice and passes change-detection lint
