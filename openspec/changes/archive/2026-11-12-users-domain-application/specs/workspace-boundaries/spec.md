# Spec Delta

## MODIFIED Requirements

### Requirement: Framework-free layers
Domain and framework-free kernel sources SHALL reject Angular, RxJS and symbols with transitive framework dependencies, including through renamed imports and intermediary re-exports. The single kernel barrel MAY export Angular application contracts. Only kernel tokens and the UseCaseCall contract MAY import Angular core, with core testing helpers allowed in their colocated specs. RxJS SHALL remain forbidden throughout kernel. Lint SHALL enforce the boundaries for type and value imports; namespace imports and export-all from the mixed barrel SHALL be rejected in framework-free sources.

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

## ADDED Requirements

### Requirement: Owned components use Angular 22 default change detection
Owned components SHALL use Angular 22’s implicit OnPush strategy unless they explicitly require a different strategy. Workspace lint and engineering guidance SHALL allow the default and intentional overrides.

#### Scenario: Owned component omits redundant metadata
- **WHEN** an owned component relies on the default strategy
- **THEN** it passes change-detection lint without a strategy declaration

#### Scenario: Explicit strategy override is preserved
- **WHEN** an owned component explicitly requires a non-default strategy
- **THEN** it retains that choice and passes change-detection lint
