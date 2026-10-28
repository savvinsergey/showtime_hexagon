import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkTags, createNxIgnore } from './check-tags.mjs';

/**
 * Same patterns as the repository `.nxignore`.
 */
const NX_IGNORE = ['libs/shared/spartan-ui/*/', '!libs/shared/spartan-ui/src/'].join('\n');

describe('checkTags', () => {
  /**
   * @type {string}
   */
  let root;

  /**
   * @param {string} directory Root-relative project directory.
   * @param {object} project Content of project.json.
   */
  const writeProject = (directory, project) => {
    mkdirSync(path.join(root, directory), { recursive: true });
    writeFileSync(path.join(root, directory, 'project.json'), JSON.stringify(project));
  };

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'check-tags-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('passes when every project has type and scope tags', () => {
    writeProject('apps/shell', { name: 'shell', tags: ['type:app', 'scope:shell'] });
    writeProject('libs/layout/ui', { name: 'layout', tags: ['scope:layout', 'type:ui'] });

    const result = checkTags({ root });

    assert.deepEqual(result.offenders, []);
    assert.equal(result.checked, 2);
  });

  it('fails and names a project without any tags', () => {
    writeProject('libs/shared/orphan', { name: 'orphan', tags: [] });

    const { offenders } = checkTags({ root });

    assert.equal(offenders.length, 1);
    assert.equal(offenders[0].name, 'orphan');
    assert.deepEqual(offenders[0].missing, ['type:', 'scope:']);
  });

  it('fails when the tags property is absent', () => {
    writeProject('libs/shared/no-tags', { name: 'no-tags' });

    const { offenders } = checkTags({ root });

    assert.deepEqual(
      offenders.map(({ name }) => name),
      ['no-tags'],
    );
  });

  it('fails when the scope tag is missing', () => {
    writeProject('libs/shared/no-scope', { name: 'no-scope', tags: ['type:util'] });

    const { offenders } = checkTags({ root });

    assert.deepEqual(offenders, [
      { name: 'no-scope', file: 'libs/shared/no-scope/project.json', missing: ['scope:'] },
    ]);
  });

  it('fails when the type tag is missing', () => {
    writeProject('libs/shared/no-type', { name: 'no-type', tags: ['scope:shared'] });

    const { offenders } = checkTags({ root });

    assert.deepEqual(offenders[0].missing, ['type:']);
  });

  it('falls back to the directory when the project has no name', () => {
    writeProject('libs/shared/unnamed', { tags: [] });

    const { offenders } = checkTags({ root });

    assert.equal(offenders[0].name, 'libs/shared/unnamed');
  });

  it('skips an untagged project hidden by .nxignore', () => {
    writeProject('libs/shared/spartan-ui', {
      name: 'shared-spartan-ui',
      tags: ['type:ui', 'scope:shared'],
    });
    writeProject('libs/shared/spartan-ui/button', { name: 'spartan-button', tags: [] });

    const result = checkTags({ root, nxIgnore: NX_IGNORE });

    assert.deepEqual(result.offenders, []);
    assert.equal(result.checked, 1);
    assert.equal(result.skipped, 1);
  });

  it('still fails an untagged project that .nxignore does not hide', () => {
    writeProject('libs/shared/spartan-ui/button', { name: 'spartan-button', tags: [] });

    const { offenders } = checkTags({ root });

    assert.deepEqual(
      offenders.map(({ name }) => name),
      ['spartan-button'],
    );
  });

  it('ignores project.json files outside apps and libs and inside node_modules', () => {
    writeProject('tools/other', { name: 'other', tags: [] });
    writeProject('libs/shared/node_modules/dep', { name: 'dep', tags: [] });

    assert.deepEqual(checkTags({ root }).offenders, []);
  });

  it('reports the file of an invalid project.json', () => {
    mkdirSync(path.join(root, 'libs/broken'), { recursive: true });
    writeFileSync(path.join(root, 'libs/broken/project.json'), '{ nope');

    assert.throws(() => checkTags({ root }), /libs\/broken\/project\.json/);
  });
});

describe('createNxIgnore', () => {
  const isIgnored = createNxIgnore(NX_IGNORE);

  it('hides files of directories matched by a `*` directory pattern', () => {
    assert.equal(isIgnored('libs/shared/spartan-ui/button/project.json'), true);
    assert.equal(isIgnored('libs/shared/spartan-ui/button/src/index.ts'), true);
  });

  it('keeps the parent project and the negated directory visible', () => {
    assert.equal(isIgnored('libs/shared/spartan-ui/project.json'), false);
    assert.equal(isIgnored('libs/shared/spartan-ui/src/index.ts'), false);
    assert.equal(isIgnored('libs/shared/styles/project.json'), false);
  });

  it('supports comments, blank lines, unanchored and anchored patterns', () => {
    const ignore = createNxIgnore(['# comment', '', 'dist/', '/root-only', 'a/**/z'].join('\n'));

    assert.equal(ignore('libs/x/dist/project.json'), true);
    assert.equal(ignore('root-only/project.json'), true);
    assert.equal(ignore('libs/root-only/project.json'), false);
    assert.equal(ignore('a/b/c/z/project.json'), true);
    assert.equal(ignore('a/z/project.json'), true);
  });

  it('supports `**` as the whole pattern and as a leading segment', () => {
    const everything = createNxIgnore('**');
    const nested = createNxIgnore('**/generated/');

    assert.equal(everything('libs/x/project.json'), true);
    assert.equal(nested('generated/project.json'), true);
    assert.equal(nested('libs/a/b/generated/project.json'), true);
    assert.equal(nested('libs/a/b/generated-not/project.json'), false);
  });

  it('applies the last matching rule and handles CRLF', () => {
    const ignore = createNxIgnore('libs/*/\r\n!libs/keep/\r\n');

    assert.equal(ignore('libs/drop/project.json'), true);
    assert.equal(ignore('libs/keep/project.json'), false);
  });
});

describe('check-tags CLI', () => {
  /**
   * @type {string}
   */
  let fixtureRoot;

  /**
   * Copies the script into the fixture repository (the CLI resolves the root from its own location).
   *
   * @param {string} directory Root-relative project directory.
   * @param {object} project Content of project.json.
   */
  const writeProject = (directory, project) => {
    mkdirSync(path.join(fixtureRoot, directory), { recursive: true });
    writeFileSync(path.join(fixtureRoot, directory, 'project.json'), JSON.stringify(project));
  };

  /**
   * @returns {import('node:child_process').SpawnSyncReturns<string>} Result of running the copied CLI.
   */
  const runCli = () =>
    spawnSync(process.execPath, [path.join(fixtureRoot, 'tools/lint/check-tags.mjs')], {
      encoding: 'utf8',
    });

  beforeEach(() => {
    fixtureRoot = mkdtempSync(path.join(tmpdir(), 'check-tags-cli-'));
    mkdirSync(path.join(fixtureRoot, 'tools/lint'), { recursive: true });
    const sourceScript = fileURLToPath(new URL('check-tags.mjs', import.meta.url));
    copyFileSync(sourceScript, path.join(fixtureRoot, 'tools/lint/check-tags.mjs'));
  });

  afterEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it('exits with code 1 and prints the name of an untagged project', () => {
    writeProject('apps/shell', { name: 'shell', tags: ['type:app', 'scope:shell'] });
    writeProject('libs/shared/orphan', { name: 'orphan', tags: ['type:util'] });

    const { status, stderr } = runCli();

    assert.equal(status, 1);
    assert.match(stderr, /orphan/);
    assert.match(stderr, /missing scope:\*/);
    assert.doesNotMatch(stderr, /shell/);
  });

  it('still fails on an untagged project when invoked through a symlinked path', () => {
    writeProject('libs/shared/orphan', { name: 'orphan', tags: ['type:util'] });
    const linkRoot = `${fixtureRoot}-link`;
    symlinkSync(fixtureRoot, linkRoot);

    try {
      const { status, stderr } = spawnSync(
        process.execPath,
        [path.join(linkRoot, 'tools/lint/check-tags.mjs')],
        {
          encoding: 'utf8',
        },
      );

      assert.equal(status, 1);
      assert.match(stderr, /orphan/);
    } finally {
      rmSync(linkRoot, { force: true });
    }
  });

  it('exits with code 0 when every project is tagged', () => {
    writeProject('apps/shell', { name: 'shell', tags: ['type:app', 'scope:shell'] });

    const { status, stdout } = runCli();

    assert.equal(status, 0);
    assert.match(stdout, /1 projects tagged/);
  });

  it('honours the root .nxignore when deciding which projects are checked', () => {
    writeFileSync(path.join(fixtureRoot, '.nxignore'), 'libs/hidden/\n');
    writeProject('libs/hidden', { name: 'hidden', tags: [] });

    const { status, stdout } = runCli();

    assert.equal(status, 0);
    assert.match(stdout, /1 hidden by \.nxignore skipped/);
  });
});
