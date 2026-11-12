# Design

## Context

UsersApplicationService.run creates a writable signal and invokes resolveCall. resolveCall awaits an operation, completes status and optionally reloads this.lastQuery. completedStatus also serves resolveLoad. Kernel already exposes generic UseCaseCall/OperationStatus via its mixed public entry, but Angular core is currently permitted only in tokens and UseCaseCall. See proposal.md for motivation.

Workspace inspection confirms `users-application -> users-domain, shared-kernel`, `users-domain -> shared-kernel`, and no workspace dependencies from `shared-kernel`. The existing alias is `@showtime/shared/kernel`; its public barrel already separates pure symbols from Angular-dependent contracts through symbol-level lint. Users remains the bounded-context owner of `UsersError`, queries, repository/state ports and mutation policy. The extraction changes no domain model or adapter binding.

## Goals / Non-Goals

Share the established call lifecycle without importing Users models, queries, ports or reload policy into kernel. Preserve observable sequencing and existing exception semantics. No generic repository/list controller, new library or resource migration.

## Alternatives

1. Keep the private facade helper: smallest local implementation, but reusable lifecycle knowledge remains coupled to Users. This does not satisfy the approved shared runner requirement.
2. Export one generic function from the existing kernel: preserves the single public entry and current call contract, requires only a named Angular exception and leaves context policy with its owner. Selected.
3. Introduce an injectable runner service, new library or generic list controller: adds provisioning or dependency structure without a required implementation variant; a list controller would also absorb Users policy. Rejected under KISS/YAGNI.

## Ownership and dependency flow

```text
Users driving port (unchanged)
  -> private Users facade -> Users use cases -> repository/state ports
           |                       -> pure Users domain
           +-> kernel runUseCase -> pure Result / OperationStatus / enum
                         +-> Angular core signal / UseCaseCall
```

`libs/shared/kernel/src/lib/utils/run-use-case/` owns `run-use-case.ts` and `run-use-case.spec.ts`; `src/index.ts` explicitly exports only `runUseCase` from that helper. Its resolver is module-private. Existing types/enums remain authoritative and are imported by relative paths inside kernel. No new port or adapter is needed: the supplied `execute` closure delegates to established use cases; the supplied hook is a synchronous notification, not an I/O abstraction. The facade stays private behind the existing Users driving port.

## Approach

- Add utils/run-use-case/run-use-case.ts with colocated tests and JSDoc, exported explicitly through the single kernel public entry. Signature: runUseCase<T,E>(execute: () => Promise<Result<T,E>>, onSuccess?: (value: T) => void): UseCaseCall<T,E>. No DI service or base class needed. resolveCall remains private in that file, not a second public API.
- Allocate Loading signal per call, expose asReadonly, and execute through the private async resolver immediately. After awaiting Result, set Success/Error before the optional success hook; return the exact Result object. Do not catch or normalize unexpected exceptions. Sync execute throws become a rejected result promise as with today's async resolver; status remains Loading. A throwing hook rejects with Success already set. Hooks are synchronous notification points, not awaited async work.
- Users get invokes the helper without a hook. Mutation callbacks check lastQuery at completion and call load without awaiting its promise. A small Users-owned reload helper is allowed to avoid repeating this rule; generic execution/resolution logic leaves the facade. Keep resolveLoad, completedStatus for list resolution, generation cancellation and lastQuery locally. No public driving signature changes.
- Extend the kernel folder purposes with utils only for actual runtime helpers. Allow Angular core only for this named runner path and colocated tests; update eslint.conventions.mjs overrides and kernel-entry grouping/boundary fixtures narrowly. Pure exports must still not transitively reach the runner, including renamed and intermediary imports. RxJS remains forbidden.
- Align engineering conventions and ADR-0002/0003 as needed, plus conflicting active-change design text. Preserve unrelated pending hunks; mixed documents may remain uncommitted with explicit disclosure. Do not rewrite historical progress.

The new Angular allowance names only `src/lib/utils/run-use-case/run-use-case.ts` and its `run-use-case.spec.ts`; it does not allow the whole `utils/` tree. Production may use `@angular/core`, with `@angular/core/testing` confined to the colocated spec. All other Angular packages and all RxJS remain forbidden. Keep the existing token/call exceptions and the mixed-barrel exception intact. Pure domain/kernel consumers must fail lint for type/value imports or re-exports that reach the runner, including aliases and intermediary modules; named pure imports remain valid. The Nx graph verifies project direction but cannot prove this symbol-level boundary, so real ESLint probes are required as well.

Each call allocates Loading before invoking `execute`; the private async resolver starts immediately, then resumes after awaiting its Result. On success it sets Success, invokes the hook once with the original value, then fulfills with the original Result. On a failed Result it sets Error with the original error reference and skips the hook. No Idle or Cancelled transition is added to the runner. Only Users list orchestration can supersede list calls. A mutation hook reads `lastQuery` when persistence completes, rather than capturing the query when the mutation starts; `load` continues to own cloning, generation changes, listStatus and page writes. A normal failed reload Result affects listStatus alone; neither its completion nor its outcome is awaited by the mutation.

## Risks / Trade-offs

- [Reload ordering regression] → Controlled promises assert Success before callback, latest-query read at completion, no awaiting reload, and independent reload failure.
- [Kernel purity regression] → Named path exception and real lint probes for domain/pure-kernel direct and intermediary imports, with pure controls. Do not allow Angular throughout utils.
- [Out-of-contract rejection leaves Loading] → Preserve current behavior explicitly; error normalization/cancellation redesign is out of scope, context adapters return Result by contract.
- [Early abstraction] → Extract only the two existing lifecycle methods and one success notification hook required by current Users reload; no options framework or transport layer.

## Migration Plan

First land helper, public export, narrow lint/rule changes and helper/boundary tests. Then migrate Users and run regression tests. Full review/testing per task; final affected lint/test/build and analyst acceptance. Exclude empty shell:test and harness-only test-build with reasons; include real affected build consumers. Reconcile overlapping unarchived kernel deltas only at future explicit archive. No archive/push/release. Rollback reverts task commits.

## Decisions

- [ADR-0001](../../../docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md): retain inward layer/scope constraints and supplement project tags with symbol-level purity checks.
- [ADR-0002](../../../docs/adr/0002-framework-free-shared-kernel.md): mixed public entry with symbol-level purity; narrowly extend integration exception.
- [ADR-0003](../../../docs/adr/0003-users-model-and-application-ports.md): Users facade retains orchestration and driving contracts.

All three paths were verified against the accepted ADRs. No separate ADR is needed: ST-0001 narrowly aligns ADR-0002's folder/Angular allowlist wording and ADR-0003's generic lifecycle delegation wording with this approved extraction, retaining their existing ownership and dependency decisions.
