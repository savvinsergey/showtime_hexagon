<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Project context: Angular 22 + spartan/ui (local library)

## Stack
- Framework: Angular 22+ (strict TypeScript, standalone components, zoneless-ready)
- UI library: spartan/ui (separate install, brain primitives + helm styles)
- Structure: Nx-style workspace (UI code lives in a shared library)
- CSS: Tailwind CSS (utility-first)

## spartan UI imports
- Do not import Helm components directly from `@spartan-ng/helm/...`.
- Import every spartan UI component (Button, Dialog, Input, Card, and so on) from the local library `libs/shared/spartan-ui`.
- Use the path alias configured in tsconfig. Example: `import { HlmButtonDirective } from '@shared/spartan-ui';`. If the alias in tsconfig differs, update this rule.

## Code rules

1. **Angular 22 reactivity (Signals):**
   - Write code that runs without Zone.js (zoneless).
   - Use Signals only for reactive state (`signal()`, `computed()`, `effect()`).
   - Use the new input/output APIs: `input()`, `input.required()`, `model()`, and `output()`.
   - For async data and API calls inside services and components, use `resource()` or `rxResource()` from `@angular/core/rxjs-interop`.
   - Every new component is `standalone: true`.

2. **Templates:**
   - Use the built-in control flow only (`@if`, `@for`, `@switch`, `@empty`). Do not use `*ngIf` or `*ngFor`.
   - Use `@let` for local template variables (intermediate values or unwrapping signals).

3. **spartan/ui and Tailwind:**
   - Style our own markup with BEM classes in the component SCSS file. Put Tailwind utilities inside those classes with `@apply`. Do not put Tailwind utility classes on the template for our own styling.
   - Name classes `block`, `block__element`, and `block--modifier` (an element modifier is `block__element--modifier`). Nest elements and modifiers under the block with `&__` and `&--`. The block name matches the component.
   - Keep spartan directives (`hlmBtn`, `hlmSidebarTrigger`, and so on) on the element. Add the BEM class next to them when that element also needs our styles. Do not build utility strings with `hlm(...)`.

4. **RxJS (keep it small):**
   - Use RxJS only for complex event streams (for example, combining WebSocket streams). Debounce form fields with Signal Forms.
   - Store state and render the UI with Signals.

## Planning (OpenSpec)
- Non-trivial work is planned as an OpenSpec change via `/opsx-propose` (files under `openspec/changes/<name>/`: `proposal.md`, `specs/`, `design.md`, `tasks.md`). Agree the plan with the user before `/ship <change>`. Running `/ship` is the approval; the Build button is optional.
- After `/ship` (or Build, when an approved change exists), the `orchestrator` subagent runs the change. Pass it the change name. It commits each finished task on branch `change/<name>`. Use `/ship` instead of `/opsx-apply`. Do not call `orchestrator` or `architect` before the plan is approved.
- Requirements and WHEN/THEN scenarios in `specs/` are the source of truth for acceptance. Archive a finished change with `/opsx-archive`.
- Shared engineering rules for subagents (Angular, SOLID/KISS/DRY/YAGNI, JSDoc, tests) live in `.agents/rules/engineering-conventions.md`. When they disagree, this file (`AGENTS.md`) wins.
- Small edits that do not need OpenSpec go through `/fix` (developer, then reviewer, then tester when needed) or a normal chat request. `orchestrator`, `architect`, and `analyst` stay out of those. Anything that changes behavior described in `specs/`, touches several layers or libraries, or needs a new port or layer goes through `/opsx-propose`.
- Versioning: semver per project (`shell`, `layout`) via `nx release` and conventional commits. Tags are `<project>@<version>`. Each project has a `CHANGELOG.md` at its root. Release only with `/release` after merge. Subagents do not create versions or tags. To version a new project, add it to `release.projects` in `nx.json` and add a root `package.json` for that project (`private: true`, `version: 0.0.0`).


## Shared host integration
- Before designing, coding, reviewing or testing, read `.agents/rules/engineering-conventions.md`; consult relevant sections of `.agents/rules/engineering-examples.md` as needed.
- Shared role bodies live in `.agents/roles`. Host adapters load them explicitly.
- In Codex the main agent executes the orchestrator role for `ship` and launches specialists sequentially. Do not spawn an additional orchestrator layer. This host rule overrides references to delegating the orchestrator or the Cursor Build button above. Explicit user approval or invoking the ship skill authorizes implementation.
- Cursor slash commands map to shared skills; in Codex use `$ship`, `$fix`, `$release` or explicitly request those workflows.
- Direct OpenSpec implementation requests enter `ship`; apply guidance is used inside its developer stage, without bypassing review, tests or acceptance.
- Discover available host tools; permissions, model selection and background execution use host-native configuration.
