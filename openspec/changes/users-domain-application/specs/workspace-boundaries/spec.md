# Spec Delta

## MODIFIED Requirements

### Requirement: Framework-free layers
Domain and pure kernel sources SHALL reject Angular, RxJS and imports of the Angular kernel entry or its internals. Only the kernel Angular integration entry MAY import Angular core within the kernel. Lint SHALL enforce these restrictions for type and value imports.

#### Scenario: Angular import in domain is rejected
- **WHEN** a `type:domain` library imports from `@angular/core`
- **THEN** lint reports a restricted import error

#### Scenario: RxJS import in kernel is rejected
- **WHEN** a `type:kernel` library imports from `rxjs`
- **THEN** lint reports a restricted import error

#### Scenario: Domain cannot reach the Angular kernel entry
- **WHEN** domain source imports a contract from `@shared/kernel/angular`
- **THEN** lint rejects the import even though the kernel project is an allowed dependency

#### Scenario: Pure kernel cannot re-export its Angular integration
- **WHEN** a pure kernel source or barrel references the Angular integration through its alias or a relative import
- **THEN** lint rejects the dependency

## ADDED Requirements

### Requirement: Owned components use Angular 22 default change detection
Owned components SHALL use Angular 22’s implicit OnPush strategy unless they explicitly require a different strategy. Workspace lint and engineering guidance SHALL allow the default and intentional overrides.

#### Scenario: Owned component omits redundant metadata
- **WHEN** an owned component relies on the default strategy
- **THEN** it passes change-detection lint without a strategy declaration

#### Scenario: Explicit strategy override is preserved
- **WHEN** an owned component explicitly requires a non-default strategy
- **THEN** it retains that choice and passes change-detection lint
