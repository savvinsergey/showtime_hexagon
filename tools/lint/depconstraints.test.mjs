import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { depConstraints as dependencyConstraints } from '../../eslint.depconstraints.mjs';

/**
 * Evaluates dependency constraints for one dependency with the `@nx/enforce-module-boundaries`
 * semantics.
 *
 * Every constraint whose `sourceTag` is `*` or one of the source tags applies (AND semantics).
 * The dependency is allowed only if each applicable constraint allows it: the target needs at
 * least one tag listed in `onlyDependOnLibsWithTags`, or the list contains `*`.
 * A target without tags is rejected as soon as one applicable constraint lacks `*`.
 *
 * Limits: models projects as tag sets only. It does not read the Nx project graph, so it
 * proves the rule data, not that real import edges are linted (the real rule is covered by
 * `npx nx lint`). Real Nx also supports wildcard/regex tags, `allSourceTags` and
 * `notDependOnLibsWithTags`, which this helper does not model (the current data uses none; the
 * `uses only sourceTag and onlyDependOnLibsWithTags keys` test guards against silent divergence).
 *
 * @param {readonly string[]} sourceTags Tags of the importing project.
 * @param {readonly string[]} targetTags Tags of the imported project.
 * @param {ReadonlyArray<{ sourceTag: string, onlyDependOnLibsWithTags: string[] }>} [constraints]
 * Constraints to evaluate; defaults to the real `depConstraints` (a modified copy is used by the
 * mutation self-checks).
 * @returns {boolean} `true` when every applicable constraint allows the dependency.
 */
const isAllowed = (sourceTags, targetTags, constraints = dependencyConstraints) =>
  constraints
    .filter(({ sourceTag }) => sourceTag === '*' || sourceTags.includes(sourceTag))
    .every(
      ({ onlyDependOnLibsWithTags: allowed }) =>
        allowed.includes('*') || targetTags.some(tag => allowed.includes(tag)),
    );

/**
 * Builds a project tag set.
 *
 * @param {string} type Layer, without the `type:` prefix.
 * @param {string} scope Scope, without the `scope:` prefix.
 * @returns {string[]} Tags of the project.
 */
const project = (type, scope) => [`type:${type}`, `scope:${scope}`];

/**
 * Returns a copy of the constraints without the entries for one source tag (mutation).
 *
 * @param {string} sourceTag Source tag whose entries are removed.
 * @returns {Array<{ sourceTag: string, onlyDependOnLibsWithTags: string[] }>} Mutated copy.
 */
const withoutEntry = sourceTag => {
  const mutated = dependencyConstraints.filter(entry => entry.sourceTag !== sourceTag);

  assert.notEqual(
    mutated.length,
    dependencyConstraints.length,
    `no depConstraints entry for ${sourceTag}`,
  );

  return mutated;
};

/**
 * Returns the tag of a project that starts with the given prefix.
 *
 * @param {readonly string[]} tags Tags of the project.
 * @param {string} prefix Tag prefix, e.g. `scope:`.
 * @returns {string} The first matching tag.
 */
const tagWithPrefix = (tags, prefix) => {
  const tag = tags.find(candidate => candidate.startsWith(prefix));

  assert.ok(tag, `no ${prefix}* tag in ${JSON.stringify(tags)}`);

  return tag;
};

/**
 * Projects used by the cases; they mirror the taxonomy from design.md. Some projects are
 * hypothetical (e.g. `sharedDomain`): they exist so that a case differs from the allowed
 * pair in exactly one rule (layer or scope).
 */
const projects = {
  usersDomain: project('domain', 'users'),
  usersApplication: project('application', 'users'),
  usersInfrastructure: project('infrastructure', 'users'),
  usersFeature: project('feature', 'users'),
  usersUi: project('ui', 'users'),
  usersContracts: project('contracts', 'users'),
  usersApp: project('app', 'users'),
  otherDomain: project('domain', 'orders'),
  otherApplication: project('application', 'orders'),
  otherUi: project('ui', 'orders'),
  otherContracts: project('contracts', 'orders'),
  kernel: project('kernel', 'shared'),
  sharedDomain: project('domain', 'shared'),
  sharedUi: project('ui', 'shared'),
  sharedUtil: project('util', 'shared'),
  layoutUi: project('ui', 'layout'),
  layoutUtil: project('util', 'layout'),
  shell: project('app', 'shell'),
  shellUtil: project('util', 'shell'),
};

/**
 * Lists the rejected cases that are NOT rejected by the given rule alone: a case is isolated
 * when it is rejected by the real constraints and becomes allowed once the source's entry for
 * that tag kind is removed from a copy. An empty result proves the cases do not pass for
 * another reason.
 *
 * @param {ReadonlyArray<readonly [string, string[], string[]]>} cases `[name, source, target]`.
 * @param {string} prefix `type:` for layer rules, `scope:` for scope rules.
 * @returns {string[]} Names of the cases not isolated to that rule.
 */
const findNotIsolatedByRule = (cases, prefix) =>
  cases
    .filter(([, source, target]) => {
      const mutated = withoutEntry(tagWithPrefix(source, prefix));

      return isAllowed(source, target) || !isAllowed(source, target, mutated);
    })
    .map(([name]) => name);

describe('depConstraints structure', () => {
  it('has a sourceTag and a non-empty tag list in every entry', () => {
    for (const entry of dependencyConstraints) {
      assert.equal(typeof entry.sourceTag, 'string', JSON.stringify(entry));
      assert.ok(entry.sourceTag.length > 0, JSON.stringify(entry));
      assert.ok(Array.isArray(entry.onlyDependOnLibsWithTags), entry.sourceTag);
      assert.ok(entry.onlyDependOnLibsWithTags.length > 0, entry.sourceTag);
    }
  });

  // Project convention, stricter than Nx (Nx ANDs duplicated entries): one entry per source tag
  // keeps each rule in one place.
  it('has no duplicated sourceTag (project convention, stricter than Nx)', () => {
    const tags = dependencyConstraints.map(({ sourceTag }) => sourceTag);

    assert.deepEqual(tags, [...new Set(tags)]);
  });

  it('uses only sourceTag and onlyDependOnLibsWithTags keys and no wildcard tags', () => {
    for (const entry of dependencyConstraints) {
      assert.equal(Object.keys(entry).length, 2, JSON.stringify(entry));
      assert.ok('sourceTag' in entry && 'onlyDependOnLibsWithTags' in entry, entry.sourceTag);
      assert.ok(!entry.sourceTag.includes('*'), `wildcard sourceTag ${entry.sourceTag}`);

      for (const tag of entry.onlyDependOnLibsWithTags) {
        assert.ok(tag === '*' || !/[*?^$()[\]{}|\\/]/.test(tag), `wildcard or regex tag ${tag}`);
      }
    }
  });
});

describe('depConstraints layer rules', () => {
  // Every pair stays within allowed scopes, so only the layer rule can reject it.
  const rejected = [
    ['domain -> application', projects.usersDomain, projects.usersApplication],
    ['feature -> infrastructure', projects.usersFeature, projects.usersInfrastructure],
    ['feature -> domain', projects.usersFeature, projects.usersDomain],
    ['ui -> application', projects.usersUi, projects.usersApplication],
    ['application -> infrastructure', projects.usersApplication, projects.usersInfrastructure],
    ['ui -> app', projects.usersUi, projects.usersApp],
    ['kernel -> domain', projects.kernel, projects.sharedDomain],
    ['util -> ui', projects.sharedUtil, projects.sharedUi],
    ['contracts -> domain', projects.usersContracts, projects.usersDomain],
  ];

  const allowed = [
    ['application -> domain', projects.usersApplication, projects.usersDomain],
    ['application -> kernel', projects.usersApplication, projects.kernel],
    ['application -> util', projects.usersApplication, projects.sharedUtil],
    ['application -> contracts', projects.usersApplication, projects.usersContracts],
    ['domain -> kernel', projects.usersDomain, projects.kernel],
    ['infrastructure -> domain', projects.usersInfrastructure, projects.usersDomain],
    ['infrastructure -> application', projects.usersInfrastructure, projects.usersApplication],
    ['feature -> application', projects.usersFeature, projects.usersApplication],
    ['feature -> shared ui', projects.usersFeature, projects.sharedUi],
    ['ui -> shared ui', projects.layoutUi, projects.sharedUi],
    ['ui -> util', projects.layoutUi, projects.sharedUtil],
    ['contracts -> kernel', projects.usersContracts, projects.kernel],
    ['contracts -> contracts', projects.usersContracts, projects.otherContracts],
  ];

  for (const [name, source, target] of rejected) {
    it(`rejects ${name}`, () => {
      assert.equal(isAllowed(source, target), false);
    });
  }

  for (const [name, source, target] of allowed) {
    it(`allows ${name}`, () => {
      assert.equal(isAllowed(source, target), true);
    });
  }

  it('allows an app to depend on every layer within its scope rules', () => {
    const layers = [
      'domain',
      'application',
      'infrastructure',
      'feature',
      'ui',
      'util',
      'kernel',
      'contracts',
    ];

    for (const layer of layers) {
      assert.equal(isAllowed(projects.usersApp, project(layer, 'users')), true, `app -> ${layer}`);
      assert.equal(isAllowed(projects.shell, project(layer, 'shared')), true, `shell -> ${layer}`);
    }
  });

  it('rejects every layer case only because of the source type:* entry (mutation self-check)', () => {
    assert.deepEqual(findNotIsolatedByRule(rejected, 'type:'), []);
  });

  it('would allow domain -> application without the type:domain entry (mutation self-check)', () => {
    const mutated = withoutEntry('type:domain');

    assert.equal(isAllowed(projects.usersDomain, projects.usersApplication, mutated), true);
  });
});

describe('depConstraints scope rules', () => {
  // Every pair is allowed by the layer table, so only the scope rule can reject it.
  const rejected = [
    ['shell -> users', projects.shell, projects.usersApplication],
    [
      'users -> other-scope internals (application)',
      projects.usersFeature,
      projects.otherApplication,
    ],
    ['users -> other-scope internals (domain)', projects.usersApplication, projects.otherDomain],
    ['users -> other-scope internals (ui)', projects.usersUi, projects.otherUi],
    ['users -> layout internals', projects.usersUi, projects.layoutUi],
    ['shared -> users', projects.sharedUi, projects.usersUi],
    ['shared -> layout', projects.sharedUi, projects.layoutUi],
    ['layout -> shell', projects.layoutUtil, projects.shellUtil],
  ];

  const allowed = [
    ['users -> other-scope contracts', projects.usersApplication, projects.otherContracts],
    ['users -> own scope', projects.usersApplication, projects.usersDomain],
    ['users -> shared', projects.usersFeature, projects.sharedUi],
    ['shell -> layout', projects.shell, projects.layoutUi],
    ['shell -> shared', projects.shell, projects.sharedUi],
    ['layout -> shared', projects.layoutUi, projects.sharedUi],
  ];

  for (const [name, source, target] of rejected) {
    it(`rejects ${name}`, () => {
      assert.equal(isAllowed(source, target), false);
    });
  }

  for (const [name, source, target] of allowed) {
    it(`allows ${name}`, () => {
      assert.equal(isAllowed(source, target), true);
    });
  }

  it('lets an app of the users scope depend on its own layers but not on other scopes', () => {
    assert.equal(isAllowed(projects.usersApp, projects.usersFeature), true);
    assert.equal(isAllowed(projects.usersApp, projects.otherApplication), false);
  });

  it('rejects every scope case only because of the source scope:* entry (mutation self-check)', () => {
    assert.deepEqual(findNotIsolatedByRule(rejected, 'scope:'), []);
  });

  it('would allow users -> other-scope internals without the scope:users entry (mutation self-check)', () => {
    const mutated = withoutEntry('scope:users');

    assert.equal(isAllowed(projects.usersFeature, projects.otherApplication, mutated), true);
  });

  it('would allow shell -> users without the scope:shell entry (mutation self-check)', () => {
    const mutated = withoutEntry('scope:shell');

    assert.equal(isAllowed(projects.shell, projects.usersApplication, mutated), true);
  });
});

describe('depConstraints untagged targets', () => {
  it('rejects a tagged project depending on an untagged project', () => {
    assert.equal(isAllowed(projects.usersApplication, []), false);
    assert.equal(isAllowed(projects.shell, []), false);
  });

  it('applies constraints only to tagged sources', () => {
    assert.equal(isAllowed([], projects.usersDomain), true);
  });
});
