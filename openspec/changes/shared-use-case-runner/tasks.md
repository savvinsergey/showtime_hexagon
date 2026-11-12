# Tasks

## 1. Shared lifecycle helper

- [x] ST-0001 Implement runUseCase<T,E> in kernel utils/run-use-case with private resolver, public export and JSDoc documenting synchronous hook and unexpected rejection behavior. Add colocated controlled-promise tests for original Result identity, generic error types, read-only/independent signals, immediate Loading, completion order, success-only hook and execution/hook exceptions. Narrowly extend Angular-core lint exceptions to the named helper/spec path and add real boundary fixtures for direct/renamed/intermediary imports and pure controls; keep other utils pure and RxJS forbidden. Align narrow conventions and linked ADR guidance, preserving unrelated mixed edits. Verify uncached kernel/domain lint/tests, strict kernel spec typechecks and boundary/tag suite. (covers: shared-kernel/Kernel dependencies are empty; shared-kernel/Pure consumer cannot import the runner; shared-kernel/Runner succeeds with the original result; shared-kernel/Runner preserves typed errors; shared-kernel/Concurrent calls stay independent; shared-kernel/Hook observes success before result delivery; shared-kernel/Failed operation skips hook; shared-kernel/Unexpected exceptions retain existing semantics)

## 2. Users adoption

- [ ] ST-0002 (after: ST-0001) Replace Users facade run/resolveCall with the shared helper for get/create/update/deactivate. Keep success reload callback and latest-query selection local; retain list resolution/cancellation and completedStatus where still needed. Preserve public JSDoc/signatures and keep implementation classes private. Extend facade regression tests only where coverage is missing, including latest query selected at mutation completion and success before reload. Verify uncached application lint/tests and strict spec typecheck; inspect public barrel and production imports. (covers: shared-kernel/Users mutation reload behavior is preserved; shared-kernel/Read and race behavior is preserved; shared-kernel/Reload failure does not undo persistence)

## Workflow follow-up

- Run final affected lint/test/build with task-owned scope and whole-change analyst acceptance after both tasks; exclusions are documented in design.
- Preserve existing work branch according to ship rules, all unrelated edits and mixed docs. No push or archive; future archive requires explicit approval and reconciliation of overlapping kernel deltas.
