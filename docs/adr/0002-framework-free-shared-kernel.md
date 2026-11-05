# ADR-0002: Pure shared kernel with a separate Angular entry point

- Status: Accepted
- Date: 2026-10-28

## Context

Several bounded contexts need the same domain primitives: `Result`, `DomainError`, branded `Id`, `DomainEvent`, a time source. Without a shared place each context would invent its own, and domains would either duplicate them or depend on each other. The domain layer must stay pure TypeScript (engineering conventions), so the shared place cannot pull in Angular or RxJS, and ADR-0001 only lets `type:domain` depend on `type:domain` and `type:kernel`.

## Decision Drivers

- Domain stays framework-free and testable without TestBed.
- Domain models stay plain serializable data, shared as one model across layers.
- No coupling between bounded contexts through the kernel beyond primitives.
- KISS/YAGNI: only primitives that the first context needs.

## Considered Options

1. **Put primitives into a `util` library.** Pros: no new project type. Cons: utilities may use frameworks, so domain could not depend on it without weakening ADR-0001; no way to enforce purity.
2. **Duplicate primitives per context.** Pros: full isolation. Cons: DRY violation of shared knowledge (error and result shapes), inconsistent error mapping across contexts.
3. **Dedicated `type:kernel` library `libs/shared/kernel` (`@showtime/shared/kernel`), framework-free and lint-enforced.** Pros: purity enforced by `pureConventions` (no `@angular/*`, no `rxjs`) and by the layer table; single source of primitives. Cons: one more library and lint variant.

## Decision

Use one Nx library tagged `type:kernel` and `scope:shared`, with two public entries. This refines option 3 to support Angular application consumers while keeping the domain import surface pure.

- The existing `@showtime/shared/kernel` entry exports `Result<T, E>`, `ok`, `err`, `DomainError`, `Id<Brand>`, `DomainEvent`, `Clock`, `systemClock`, `fixedClock` and the plain discriminated union `OperationStatus<E>`. Its transitive imports are pure TypeScript.
- `@shared/kernel/angular` owns one root-provided `CLOCK` token with a system-clock factory and the type `UseCaseCall<T, E>` with a status signal and a promised result. It re-exports the pure status type. Application code supplies the context error type explicitly. Domain functions receive time as an argument.
- Keep each declaration and its tests in one named folder. Public barrels refer to those declarations. Framework-neutral contracts used across contexts belong to the shared kernel. Entities, context error unions and versioned integration events belong to their bounded context.
- Use `pureConventions` in domain and the pure kernel. Restrict access to the Angular entry and its internals from both. Permit Angular core in the integration entry only. Whole-project dependency graphs cannot distinguish entries (see ADR-0001).

## Consequences

A fixed-clock override targets the same token for every context. Domain tests can import the pure barrel without initializing Angular. Consumers can use the shared status union with different error types.

Both public entries share one Nx node, so a graph check must be paired with lint checks against real import paths. Keep the pure entry from re-exporting Angular contracts, including type-only exports.

## Follow-ups

Run purity probes when changing entry points or path aliases. Add a context-neutral primitive only for an established cross-context contract.
