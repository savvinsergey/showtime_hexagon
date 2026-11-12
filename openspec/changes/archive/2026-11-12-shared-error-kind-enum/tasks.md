# Tasks

## 1. Shared classification

- [x] ST-0001 Add pure ErrorKindEnum with all six original values under `libs/shared/kernel/src/lib/enums/error-kind/` and export through the kernel public entry. Add JSDoc for the enum and each context-neutral member, colocated value/serialization and unrelated-caller type tests, and a named-export transitive purity regression using existing tooling. Update ADR-0002 and conventions to permit the shared enum, leaving the existing application enum usable until ST-0002. Verify `npx nx lint shared-kernel`, `npx nx test shared-kernel`, strict spec type assertions and existing boundary tests; no new generator, project, dependency or resolver. (covers: shared-kernel/Shared error kinds retain their values; shared-kernel/Shared classification remains pure; shared-kernel/Unrelated callers share the classification)

## 2. Users migration

- [x] ST-0002 (after: ST-0001) Atomically migrate UsersError discriminants, mapper return types, mock errors, typed fixtures, comparisons and tests to kernel ErrorKindEnum. Re-export the same enum through application; remove UsersErrorKindEnum implementation/tests/export and update any existing enums barrel without discarding user edits. Preserve all payload ownership and failure behavior. Update relevant public JSDoc, ADR-0003 and conventions to replace application enum ownership with shared classification. Add public identity/old-name rejection, narrowing/unsupported-kind and unchanged serialization/propagation coverage. Run `npx nx lint users-application`, `npx nx test users-application` and strict spec checks; inspect all old-name references and old paths to confirm none remain in production exports. Preserve and exclude unrelated working-tree edits from commits. (covers: users-application/Application exposes the kernel enum identity; users-application/Old enum name is removed; users-application/Users error payloads still narrow; users-application/Unsupported error kinds remain rejected; users-application/Users error serialization is unchanged by relocation; users-application/Users failure details survive relocation)

## Verification and acceptance

Each task receives developer, reviewer and tester stages. Because public APIs change, run final affected verification and whole-change analyst acceptance after both tasks; record scenario evidence and breaking TypeScript migration in the appropriate commit. Follow the shell:test and test-build exclusions in design.md. No release, push or archive is included.

## Workflow follow-up

- Existing unarchived enum requirements explicitly name UsersErrorKindEnum. Reconcile those superseded requirements before a separately authorized future archive; do not silently merge incompatible contracts or archive any change during implementation.
