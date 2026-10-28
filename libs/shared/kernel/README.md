# shared-kernel

Framework-free domain primitives shared by every bounded context: `Result`, `DomainError` and (next)
branded ids, domain events and `Clock`. Import it as `@showtime/shared/kernel`.

- Tags: `type:kernel`, `scope:shared`. It may depend only on other `type:kernel` projects.
- It must stay framework-free: no `@angular/*`, no `rxjs`, no other workspace libraries. The
  `pureConventions` ESLint config enforces this (see ADR-0002).
- Everything is plain data and pure functions, so values survive JSON serialization.

## Running unit tests

Run `nx test shared-kernel`. Tests use the Angular unit-test builder (`@angular/build:unit-test`,
Vitest runner). That builder requires a build target, so the project has an extra minimal
`test-build` target (`@angular/build:application` on `src/index.ts`). It is deliberately not named
`build`, so `run-many --target=build` does not try to build the kernel as an application.
