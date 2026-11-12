# Users infrastructure: read transport decision

Recorded on 2026-11-11 for planning `users-infrastructure`. This is an unresolved design question, not an approved port migration.

User direction on 2026-11-12: plan infrastructure request handling around resource APIs. Reassess `UsersApplicationService` explicitly: its current Promise-based `resolveLoad`, shared `runUseCase`, `listStatus`, reload callbacks and logical cancellation may need redesign when reactive infrastructure reads are implemented. Do not mechanically preserve Promise wrappers merely because the current ports use them. Resolve read versus mutation execution semantics, ownership and migration scenarios in the infrastructure proposal before changing these contracts. This note records future planning direction; the archived Promise contracts describe the currently implemented behavior.

Before implementing the HTTP adapter, explicitly reconcile these existing decisions:

- `UserRepositoryPort.findAll` / `findById` return `Promise<Result<…>>`. Application use-cases initiate each read; the facade owns operation statuses, last-query reloads and latest-request-wins arbitration. Infrastructure must not initiate independent fetching.
- Project instructions prefer `resource()` / `rxResource()` for asynchronous loading in services and components. Angular `httpResource()` is a reactive wrapper around `HttpClient`, exposing response and status signals and reacting to request parameter changes.
- `HttpClient` returns Observables. A one-shot adapter can bridge these to the current Promise port with `firstValueFrom()`, mapping transport failures to `UsersError`; this choice needs an explicit reconciliation with the resource rule.

Evaluate and record the choice in the `users-infrastructure` proposal/design before coding:

1. Keep one-shot Promise repository reads and document the intended HTTP-adapter exception to the resource rule.
2. Introduce a reactive read contract suited to `httpResource`, with an explicitly planned application migration. Define who owns request parameters, resource lifetime, statuses, reloads, data writes and error mapping; avoid duplicating the current facade's responsibilities or exposing HTTP details to application.

Also distinguish logical cancellation from transport cancellation. The current facade prevents stale results from updating state; it does not by itself abort an HTTP request. Decide whether physical cancellation is required and specify its port/adapter contract and tests. Changing the return type to Observable alone does not establish cancellation behavior.

Acceptance scenarios for the selected design should cover repeated queries/reloads, concurrent reads, stale results, transport errors, resource/request teardown and successful mutations whose subsequent reload fails.

Reference: [Angular — Reactive data fetching with httpResource](https://angular.dev/guide/http/http-resource).
