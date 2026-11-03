# shared-ui

Shared presentational components without domain knowledge. Import as `@shared/ui`.

- Tags: `type:ui`, `scope:shared`. Selector prefix: `st-`.
- May depend only on `@shared/spartan-ui` and util projects (see ADR-0001).
- Lint spreads `conventions` from `eslint.conventions.mjs`.

## Running unit tests

Run `nx test shared-ui`. Tests use the Angular unit-test builder (`@angular/build:unit-test`,
Vitest runner). That builder requires a build target, so the project has an extra minimal
`test-build` target (`@angular/build:application` on `src/index.ts`). It is deliberately not named
`build`, so `run-many --target=build` does not try to build the library as an application.
