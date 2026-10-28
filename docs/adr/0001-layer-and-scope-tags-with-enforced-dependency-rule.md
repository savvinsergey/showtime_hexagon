# ADR-0001: Layer and scope tags with a machine-enforced dependency rule

- Status: Accepted
- Date: 2026-10-28

## Context

The workspace is growing from a shell and a layout library into bounded contexts built as hexagonal libraries (domain, application, infrastructure, ui, feature, contracts) plus remote apps. Today only `shared-styles` has tags, and `@nx/enforce-module-boundaries` has one permissive rule (`*` -> `*`), so nothing stops outward or cross-context imports. The engineering conventions state "dependencies point inward only" but rely on review. Every later library (users domain, application, infrastructure, ui, feature, remote) depends on this rule being enforced from the first commit.

## Decision Drivers

- The dependency rule must fail in lint, not in review.
- Layer rules and context isolation are independent concerns and must evolve separately.
- Domain-like code must not be able to reach framework or utility code (testability, portability).
- The rule set must be testable without generating throw-away libraries.
- KISS/YAGNI: only tags and constraints needed by the known layers.

## Considered Options

1. **One tag dimension per project (`layer-scope` combined tags, e.g. `users-domain`).** Pros: one tag per project. Cons: combinatorial constraint list that grows with every new context; layer and scope rules cannot be reasoned about separately.
2. **Two tag dimensions: `type:*` (layer) and `scope:*` (owner), with separate constraint entries.** Pros: Nx applies every matching constraint (AND), so layer rules are written once and scope rules once per context; new contexts add one scope entry. Cons: every project needs two tags (needs a check).
3. **Folder-based rules or custom ESLint plugin.** Pros: no tags. Cons: reinvents Nx boundaries, no project-graph awareness, more maintenance.

## Decision

Option 2.

- `type:*`: `app`, `feature`, `ui`, `application`, `domain`, `infrastructure`, `contracts`, `util`, `kernel`. `scope:*`: `shell`, `layout`, `shared`, `users`; a new bounded context adds its own scope tag and one scope entry.
- Layer rule (`depConstraints` by `type:*`): domain -> domain, kernel; application -> domain, kernel, util, contracts; infrastructure -> domain, application, kernel, util; feature -> application, ui, util; ui -> ui, util; util -> util; kernel -> kernel; contracts -> kernel, contracts; app -> any.
- Scope rule (`depConstraints` by `scope:*`): shared -> shared; layout -> layout, shared; shell -> shell, layout, shared (never users); users -> users, shared and `type:contracts` of other scopes (the only cross-context channel).
- `kernel` is a separate `type` from `util`: domain may depend on kernel but not on util, because utilities may use frameworks.
- The constraints live in their own module `eslint.depconstraints.mjs` imported by `eslint.config.mjs`, so a Node test can assert the allowed/rejected pairs without running ESLint.
- Nx constraints apply only to tagged sources, so a repository check (`tools/lint/check-tags.mjs`, `npm run lint:tags`) fails when a project under `apps/` or `libs/` lacks a `type:*` or `scope:*` tag. Importing an untagged project from a tagged one is already rejected by `onlyDependOnLibsWithTags`.
- The `@nx/eslint:lint` cache inputs must include the files that define the rules (`eslint.conventions.mjs`, `eslint.depconstraints.mjs`), otherwise a changed rule can be served from a stale cache.

## Consequences

Positive:
- Layer and context isolation fail in lint; new contexts need one scope entry and tags on their libraries.
- The rule table is unit-tested; changes to it are visible in review and in a failing test.

Negative:
- Every new project must be tagged with both dimensions (enforced by `lint:tags`).
- `type:ui` -> `type:ui` is broad (shared UI and spartan UI are both `type:ui`); scope rules still stop cross-context UI imports.

Risks:
- Tagging may reveal existing violations; mitigated by running lint before and after tagging (current imports are allowed by the table).
- Sibling infrastructure libraries (`api`, `state`) are not separated by this taxonomy.
- Lint cache staleness when rule modules change (see Decision).
- Projects hidden via `.nxignore` (the ~64 helm sub-libraries under `libs/shared/spartan-ui/<name>/`) are outside Nx boundary checks and are excluded from the tag check (`lint:tags` skips ignored `project.json` paths); only the visible `shared-spartan-ui` and `shared-styles` projects are tagged.

## Follow-ups

- The infrastructure change decides whether an extra tag (e.g. `role:api` / `role:state`) separates sibling infrastructure libraries.
- End-to-end "lint rejects this import between two real libraries" is covered once real context libraries exist.
