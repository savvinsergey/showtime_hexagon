import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import ts from 'typescript';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const kernelSource = path.join(workspace, 'libs/shared/kernel/src');
const domain = 'libs/users/domain/src/index.ts';
const pure = 'libs/shared/kernel/src/index.ts';
const integration = 'libs/shared/kernel/src/angular/index.ts';
const eslint = new ESLint({ cwd: workspace });

/** Obtain framework boundary errors from the real project config for this virtual source. */
async function boundaryErrors(filePath: string, source: string) {
  const [result] = await eslint.lintText(source, { filePath });
  assert.deepEqual(
    result.messages.filter(message => message.fatal || !message.ruleId),
    [],
  );
  return result.messages.filter(message =>
    ['no-restricted-imports', 'workspace/kernel-entry'].includes(message.ruleId ?? ''),
  );
}

describe('Framework-free layers', () => {
  const rejected = [
    ['Angular import in domain is rejected', domain, "import { signal } from '@angular/core';"],
    [
      'Domain cannot reach the Angular kernel entry',
      domain,
      "import type { UseCaseCall } from '@shared/kernel/angular';",
    ],
    [
      'Domain cannot reach the Angular kernel entry via internals',
      domain,
      "export type { UseCaseCall } from '../../../shared/kernel/src/angular/use-case-call';",
    ],
    ['Pure kernel cannot re-export its Angular integration', pure, "export * from './angular';"],
    [
      'Pure kernel cannot re-export an integration type via alias',
      pure,
      "export type { UseCaseCall } from '@shared/kernel/angular';",
    ],
    [
      'Pure kernel rejects a transitive relative re-export',
      'libs/shared/kernel/src/lib/id/id.ts',
      "export type { UseCaseCall } from '../../angular/use-case-call';",
    ],
    ['RxJS import in kernel is rejected', pure, "export type { Observable } from 'rxjs';"],
    [
      'Backtick dynamic RxJS import is rejected',
      pure,
      'export const load = () => import(`rxjs/operators`);',
    ],
    [
      'Angular core testing stays in integration specs',
      integration,
      "export { TestBed } from '@angular/core/testing';",
    ],
    [
      'Integration rejects other Angular packages',
      integration,
      "export type { Location } from '@angular/common';",
    ],
  ];
  for (const [name, file, source] of rejected) {
    it(name, async () => {
      assert.ok((await boundaryErrors(file, source)).length, source);
    });
  }
  const allowed = [
    [
      'Domain may import a pure kernel type',
      domain,
      "import type { Result } from '@showtime/shared/kernel';",
    ],
    ['Integration may use core', integration, "export { InjectionToken } from '@angular/core';"],
    [
      'Integration specs may use core testing',
      'libs/shared/kernel/src/angular/clock.spec.ts',
      "export { TestBed } from '@angular/core/testing';",
    ],
  ];
  for (const [name, file, source] of allowed) {
    it(name, async () => {
      assert.deepEqual(await boundaryErrors(file, source), []);
    });
  }
});

describe('Kernel dependencies are empty', () => {
  it('resolves the public entry and follows its imports and re-exports only to pure kernel sources', () => {
    const config = ts.getParsedCommandLineOfConfigFile(
      path.join(workspace, 'tsconfig.base.json'),
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: diagnostic =>
          assert.fail(String(diagnostic.messageText)),
      },
    );
    assert.ok(config);
    const { options } = config;
    function resolve(name: string, from: string): string {
      const resolved = ts.resolveModuleName(name, from, options, ts.sys).resolvedModule;
      assert.ok(resolved, `${from} cannot resolve ${name}`);
      return resolved.resolvedFileName;
    }
    const root = resolve('@showtime/shared/kernel', path.join(workspace, domain));
    const visited = new Set<string>();
    function visit(file: string) {
      if (visited.has(file)) return;
      const relative = path.relative(kernelSource, file);
      assert.ok(relative === 'index.ts' || relative.startsWith('lib' + path.sep), file);
      visited.add(file);
      const imports = ts.preProcessFile(readFileSync(file, 'utf8'), true, true).importedFiles;
      for (const dependency of imports) visit(resolve(dependency.fileName, file));
    }
    visit(root);
    for (const name of ['clock', 'domain-error', 'domain-event', 'id', 'result']) {
      const grouped = path.join(kernelSource, 'lib', name, name);
      assert.ok(visited.has(grouped + '.ts'), `Pure entry must reach ${name}`);
      assert.ok(existsSync(grouped + '.spec.ts'), `Missing colocated spec for ${name}`);
      for (const suffix of ['.ts', '.spec.ts']) {
        assert.equal(existsSync(path.join(kernelSource, 'lib', name + suffix)), false);
      }
    }
  });
});
