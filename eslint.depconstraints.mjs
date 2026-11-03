/**
 * Module-boundary rules for `@nx/enforce-module-boundaries`.
 *
 * Plain data only (no ESLint imports) so that tests can import it directly.
 * See ADR-0001 (`docs/adr/0001-layer-and-scope-tags-with-enforced-dependency-rule.md`).
 *
 * Nx evaluates every constraint whose `sourceTag` matches a project (AND semantics),
 * so layer (`type:*`) and scope (`scope:*`) rules are separate entries.
 */

/**
 * Layer entries (`type:*`): which layers a project may depend on.
 *
 * @type {ReadonlyArray<{ sourceTag: string, onlyDependOnLibsWithTags: string[] }>}
 */
const layerConstraints = [
  { sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:domain', 'type:kernel'] },
  {
    sourceTag: 'type:application',
    onlyDependOnLibsWithTags: ['type:domain', 'type:kernel', 'type:util', 'type:contracts'],
  },
  {
    sourceTag: 'type:infrastructure',
    onlyDependOnLibsWithTags: ['type:domain', 'type:application', 'type:kernel', 'type:util'],
  },
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: ['type:application', 'type:ui', 'type:util'],
  },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
  { sourceTag: 'type:kernel', onlyDependOnLibsWithTags: ['type:kernel'] },
  { sourceTag: 'type:contracts', onlyDependOnLibsWithTags: ['type:kernel', 'type:contracts'] },
  // Apps are restricted only by scope.
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
];

/**
 * Scope entries (`scope:*`): which bounded contexts a project may depend on.
 *
 * @type {ReadonlyArray<{ sourceTag: string, onlyDependOnLibsWithTags: string[] }>}
 */
const scopeConstraints = [
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'scope:layout', onlyDependOnLibsWithTags: ['scope:layout', 'scope:shared'] },
  {
    sourceTag: 'scope:shell',
    onlyDependOnLibsWithTags: ['scope:shell', 'scope:layout', 'scope:shared'],
  },
  {
    // `type:contracts` admits contracts libraries of other scopes.
    sourceTag: 'scope:users',
    onlyDependOnLibsWithTags: ['scope:users', 'scope:shared', 'type:contracts'],
  },
];

/**
 * Dependency constraints passed to `@nx/enforce-module-boundaries` as `depConstraints`.
 *
 * @type {ReadonlyArray<{ sourceTag: string, onlyDependOnLibsWithTags: string[] }>}
 */
// eslint-disable-next-line unicorn/name-replacements -- the name is the public contract of this module (consumed by eslint.config.mjs and tests)
export const depConstraints = [...layerConstraints, ...scopeConstraints];
