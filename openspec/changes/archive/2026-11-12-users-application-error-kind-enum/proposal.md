# Proposal

## Why

Users application repeats error-kind strings in its public model, validation mapping, mocks and tests. A single exported enum will make those discriminants explicit and consistent while preserving existing error values and runtime behavior.

## What Changes

- Introduce `UsersErrorKindEnum` in application `src/lib/enums/users-error-kind/` for `validation`, `not-found`, `conflict`, `forbidden`, `network`, `unknown`.
- Use enum members in `UsersError`, typed producers, narrowing and test fixtures; export the enum from `@showtime/users/application`.
- Permit this explicitly requested application error-kind enum in engineering conventions.
- **BREAKING**: TypeScript callers constructing `UsersError` must replace raw kind strings with enum members. JSON values and error payloads remain unchanged.

## Capabilities

### New Capabilities

- `users-application`: add the public enum-backed error-kind contract. This capability is implemented and specified in the unarchived `users-domain-application` change but is not yet in main specs; use its established capability path and add only the new enum requirements here.

### Modified Capabilities

None in the current main specs.

## Impact

Affected Nx project: `users-application`. Update its error model, validation mapper, repository mock, contract suites and typed consumers/tests. Kernel and domain remain unchanged. No dependencies are added.

## Out of scope

Domain roles/statuses/errors, kernel operation status, other string fields, new error kinds, transport adapters, UI, new libraries/ports and archive or release operations.

## Breaking changes

`users-application`: `UsersError.kind` changes from raw string-literal discriminants to string-enum members. The public enum supplies the migration path; serialized values remain compatible.
