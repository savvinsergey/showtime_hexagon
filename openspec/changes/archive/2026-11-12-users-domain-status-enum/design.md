# Design

## Context

UserRoleEnum migration is complete. Status remains a union in value-objects/user-status; its guard compares raw literals. User.status and UserDraft.status refer to that union; draft/activate/deactivate produce literals. Domain fixtures and application assertions use those values. See proposal.md for motivation.

## Goals / Non-Goals

Centralize lifecycle values with the same public enum pattern as roles. Preserve runtime data and inward dependency boundaries. Do not change operation statuses, role contracts, events, ports or infrastructure behavior.

## Approach

- Introduce lib/enums/user-status/user-status.enum.ts and colocated tests/JSDoc. Export UserStatusEnum explicitly through domain and re-export the identical enum through application; keep kernel independent.
- Preserve UserStatus as an alias to UserStatusEnum at its existing location. Keep isUserStatus public and compare enum members to narrow untrusted input. No unchecked casts or duplicate value definitions.
- Use enum members in draft/activate/deactivate implementations and all normal known-status uses in domain/application/mock consumers and fixtures. Retain raw strings only where deliberately testing boundary acceptance/rejection or serialized wire values. Search all workspace consumers before final verification.
- Preserve the readonly test's intent: its forbidden reassignment must use a valid enum member so @ts-expect-error proves readonly rather than an invalid field type. Add separate negative type tests for raw assignments.
- Narrowly align status-union text in conventions and active users-domain-application design/task references. Earlier role migration records remain historical; update only present-tense guidance that would contradict the status migration. Preserve all existing unrelated edits; mixed documentation may remain uncommitted and must be disclosed.

## Architecture and Alternatives

The existing Nx graph is `users-application -> users-domain -> shared-kernel`, with application also depending directly on kernel. Public aliases are `@showtime/users/domain` and `@showtime/users/application`. Keep this graph unchanged: Users owns lifecycle vocabulary, and application forwards the domain enum by value for its consumers. No new library, port, adapter, provider or mapping is needed; existing repository/state and driving ports retain their contracts apart from the nested status type.

The authoritative definition lives at `domain/src/lib/enums/user-status/user-status.enum.ts`, exposed by the existing enums group barrel and explicit domain public entry. The existing `value-objects/user-status/user-status.ts` retains the type alias and guard. Pure lifecycle functions produce enum members; boundary guards accept raw values before those values enter typed records. Stored/serialized records remain plain data containing the same lowercase strings.

Considered alternatives:

1. Retain a string union, optionally paired with an `as const` object: keeps raw-literal assignment compatibility, but does not meet the approved enum-only typed-model contract.
2. Use one Users-owned string enum and alias it from the existing status module: introduces the approved TypeScript source break, while preserving runtime strings and matching the existing role pattern. **Selected.**
3. Move lifecycle status into the shared kernel: makes it widely accessible, but assigns a Users-specific concept to a shared owner without a second context requirement. Rejected under YAGNI.

The approved status contract supersedes only the current status-union guidance in engineering conventions and ADR-0002's present-tense follow-up. It does not replace any ADR's architectural decision or authorize changing historical migration records.

## Risks / Trade-offs

- [Breaking TypeScript API] → Migrate domain and application atomically and declare breaking commit metadata; JSON strings stay unchanged.
- [Barrel cycle] → Avoid runtime imports through value-objects where it re-exports domain service parsers; import the enum directly from its definition within domain.
- [Overlapping unarchived deltas] → Add only the specific status contract here, preserve older closed-set scenarios and reconcile at a future explicitly authorized archive.

## Migration Plan

One bounded task covers enum, alias/guard, public exports, producers/consumers, tests and narrow documentation alignment. Full review, independent tester, final affected verification and whole-change acceptance apply. Run uncached domain/application lint/tests and strict spec typechecks, plus boundary regressions/tags. Include affected consumers with actual build targets; empty shell:test and internal harness-only test-build are excluded with reasons. No release, archive or push. Rollback is a revert of the implementation commit.

## Decisions

- [ADR-0001](../../../docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md): Preserve the existing inward layer and scope dependencies and enforce them through lint/tags.
- [ADR-0002](../../../docs/adr/0002-framework-free-shared-kernel.md): Keep Users lifecycle vocabulary out of kernel and retain symbol-level framework purity; align its present-tense status follow-up to this approved contract.
- [ADR-0003](../../../docs/adr/0003-users-model-and-application-ports.md): Users model and application public boundary; retain its architecture and align lifecycle representation only if conflicting text exists.

No new ADR is needed: this changes an existing Users value representation without adding an architectural boundary, technology or dependency.
