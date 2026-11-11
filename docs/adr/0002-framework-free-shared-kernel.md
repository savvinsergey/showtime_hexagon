# ADR-0002: Single shared kernel entry with symbol-level purity boundaries

- Status: Accepted
- Date: 2026-10-28
- Updated: 2026-11-10 (user-approved single public entry)

## Context

Several bounded contexts need the same domain primitives: `Result`, `DomainError`, branded `Id`, `DomainEvent`, a time source. Without a shared place each context would invent its own, and domains would either duplicate them or depend on each other. The domain layer must stay pure TypeScript (engineering conventions), so imported domain primitives cannot transitively depend on Angular or RxJS, and ADR-0001 only lets `type:domain` depend on `type:domain` and `type:kernel`.

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

Use one Nx library tagged `type:kernel` and `scope:shared`, with the single public entry `@showtime/shared/kernel`. This supersedes the earlier secondary Angular entry decision.

- Export pure `Result<T, E>`, `ok`, `err`, `DomainError`, `Id<Brand>`, `DomainEvent`, `Clock`, `systemClock`, `fixedClock` and `OperationStatus<E>` and the pure `OperationStatusEnum` alongside Angular application contracts.
- Export one root-provided `CLOCK` token backed by `systemClock`, and `UseCaseCall<T, E>` with a read-only status signal and a promised result. Application supplies its own error type. Domain receives time as an argument.
- Organize `src/lib` by purpose: `types/`, `enums/`, `tokens/`, `constants/`. Each entity has one named folder and colocated tests. `Clock`/`fixedClock` live in `types/clock`, `CLOCK` in `tokens/clock`, `systemClock` in `constants/clock`.
- Domain and framework-free kernel implementations may consume only named symbols with no transitive Angular/RxJS dependency. Lint follows imports/re-exports through intermediary modules and renamed symbols. Namespace imports and export-all from the mixed barrel are conservatively rejected there.
- The public barrel may re-export Angular contracts. Angular core is permitted only in tokens and UseCaseCall, with core testing helpers in their specs. RxJS remains forbidden throughout kernel.
- Context-neutral shared contracts belong in kernel; entities, context-specific errors and integration events stay with their owner.
- The approved `ErrorKindEnum` classification lives in `enums/error-kind/error-kind.enum.ts` and is exported through the kernel entry. Its `Validation`, `NotFound`, `Conflict`, `Forbidden`, `Network` and `Unknown` members preserve `validation`, `not-found`, `conflict`, `forbidden`, `network` and `unknown`. Contexts own their error payloads; the shared vocabulary introduces no generic error model or context dependency.

## Consequences

A fixed-clock override targets the same token for every context. Consumers share one public path and authoritative definitions. Domain code cannot consume Angular-dependent symbols even though they share the barrel with pure primitives.

Project graphs cannot distinguish pure and Angular-dependent symbols. Pair graph checks with transitive symbol-level lint regressions; the entire barrel is intentionally not framework-free. Named imports are required for framework-free consumers.

## Follow-ups

Run purity probes when changing entry points or path aliases. Add a context-neutral primitive only for an established cross-context contract.

The approved operation lifecycle enum is defined in `enums/operation-status/operation-status.enum.ts` with `Idle`, `Loading`, `Success`, `Error` and `Cancelled` members preserving the lowercase runtime values. `OperationStatus<E>` uses these members as discriminants; only `Error` carries the mandatory `error: E`. This exception does not change domain `UserRole` or `UserStatus` string-literal unions.
