# ADR-0002: Framework-free shared kernel

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

Option 3.

- `libs/shared/kernel`: `type:kernel`, `scope:shared`, non-buildable, lint with `pureConventions` (`conventions` plus restricted `@angular/*` and `rxjs`); the same variant is spread by `type:domain` libraries.
- Primitives are plain data and functions: `Result<T, E>` (discriminated on `ok`, `ok()`/`err()` constructors), `DomainError` (`code`, `message`), `Id<Brand>` (branded string, plain string at runtime), `DomainEvent` (`type`, `occurredAt`, ISO string), `Clock` (`now(): string`) with system and fixed implementations. No classes with hidden state, so every value survives JSON unchanged.
- `Clock` has no `InjectionToken` in the kernel. The DI token and its provider belong to the application layer (a later change), which is the first layer allowed to use Angular. Domain functions never read a clock; they take `now` as an argument, so `Clock` is consumed only by application code.
- The kernel grows only when a second context needs a primitive; context-specific errors and events are defined in the context on top of these shapes.

## Consequences

Positive:
- Domain depends on a pure, stable set of primitives; framework imports in kernel or domain fail lint.
- Contexts share error/result/event shapes without depending on each other.

Negative:
- A kernel change affects every context; changes must be backward compatible and small.
- Application code needs a token wrapper for `Clock` in its own layer.

Risks:
- The kernel can become a dumping ground; mitigated by the rule above (second consumer first) and by the framework-free lint.

## Follow-ups

- Application change: `CLOCK` token and `provideX()` helper that binds the kernel `Clock` implementations.
- Revisit if a primitive needs a framework dependency; such code belongs in `util` or the application layer, not in the kernel.
