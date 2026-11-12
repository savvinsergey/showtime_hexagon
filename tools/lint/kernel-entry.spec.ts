import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { reachesFramework } from './kernel-entry.mjs';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const domain = 'libs/users/domain/src/index.ts';
const pure = 'libs/shared/kernel/src/lib/types/id/id.ts';
const integration = 'libs/shared/kernel/src/lib/tokens/clock/clock.token.ts';
const runner = 'libs/shared/kernel/src/lib/utils/run-use-case/run-use-case.ts';
const otherUtility = 'libs/shared/kernel/src/lib/utils/run-use-case/other.ts';
const eslint = new ESLint({ cwd: workspace });

async function boundaryErrors(filePath: string, source: string) {
  const [result] = await eslint.lintText(source, { filePath });
  assert.deepEqual(result.messages.filter(message => message.fatal || !message.ruleId), []);
  return result.messages.filter(message =>
    ['no-restricted-imports', 'workspace/kernel-entry'].includes(message.ruleId ?? ''));
}

describe('Unified kernel framework boundary', () => {
  const rejected = [
    ...[domain, pure, otherUtility].flatMap(file => [
      [file, "import { runUseCase } from '@showtime/shared/kernel';"],
      [file, "import { runUseCase as run } from '@showtime/shared/kernel';"],
      [file, "import type { runUseCase as Run } from '@showtime/shared/kernel';"],
      [file, "export { runUseCase as run } from '@showtime/shared/kernel';"],
      [file, "export type { runUseCase as Run } from '@showtime/shared/kernel';"],
    ]),
    [otherUtility, "import { signal } from '@angular/core';"],
    [otherUtility.replace('.ts', '.spec.ts'), "import { TestBed } from '@angular/core/testing';"],
    [runner, "import { TestBed } from '@angular/core/testing';"],
    ...[runner, runner.replace('.ts', '.spec.ts')].flatMap(file => [
      [file, "export { Location } from '@angular/common';"],
      [file, "export { toSignal } from '@angular/core/rxjs-interop';"],
      [file, "import { of } from 'rxjs';"],
      [file, "export { map } from 'rxjs/operators';"],
    ]),
    [domain, "import { signal } from '@angular/core';"],
    [domain, "import { CLOCK as clock } from '@showtime/shared/kernel';"],
    [domain, "import type { UseCaseCall as Call } from '@showtime/shared/kernel';"],
    [domain, "export type { UseCaseCall as Call } from '@showtime/shared/kernel';"],
    [domain, "import * as kernel from '@showtime/shared/kernel';"],
    [domain, "export * from '@showtime/shared/kernel';"],
    [domain, "export type { UseCaseCall } from '../../../shared/kernel/src/lib/types/use-case-call/use-case-call';"],
    [pure, "export { CLOCK } from '../../../index';"],
    [pure, "export type { UseCaseCall } from '../use-case-call/use-case-call';"],
    [pure, "export type { Observable } from 'rxjs';"],
    [pure, 'export const load = () => import(`rxjs/operators`);'],
    [pure, "type Call = import('@showtime/shared/kernel').UseCaseCall<string, string>;"],
    [integration, "export { TestBed } from '@angular/core/testing';"],
    [integration, "export type { Location } from '@angular/common';"],
  ];
  for (const [file, source] of rejected) {
    it(`rejects ${source} in ${file}`, async () => {
      assert.ok((await boundaryErrors(file, source)).length, source);
    });
  }
  for (const [file, source] of [
    [runner, "import { signal } from '@angular/core';"],
    [runner.replace('.ts', '.spec.ts'), "import { TestBed } from '@angular/core/testing';"],
    [otherUtility, "import { ok, ErrorKindEnum } from '@showtime/shared/kernel';"],
    ['libs/users/application/src/index.ts', "import { runUseCase } from '@showtime/shared/kernel';"],
    ['libs/shared/kernel/src/index.ts', "export { runUseCase } from './lib/utils/run-use-case/run-use-case';"],
    [domain, "import type { Result, Clock, OperationStatus } from '@showtime/shared/kernel';"],
    [domain, "export { fixedClock as testClock } from '@showtime/shared/kernel';"],
    [pure, "import type { Clock } from '@showtime/shared/kernel';"],
    [integration, "export { InjectionToken } from '@angular/core';"],
    [integration.replace('.ts', '.spec.ts'), "export { TestBed } from '@angular/core/testing';"],
    ['libs/shared/kernel/src/index.ts', "export { CLOCK } from './lib/tokens/clock/clock.token';"],
  ]) {
    it(`allows ${source} in ${file}`, async () => {
      assert.deepEqual(await boundaryErrors(file, source), []);
    });
  }
});

describe('Kernel source organization and transitive purity', () => {
  it('Pure consumer cannot import the runner through a renamed intermediary', async () => {
    const directory = mkdtempSync(path.join(workspace, 'tools/lint/kernel-fixture-'));
    try {
      const bridge = path.join(directory, 'bridge.ts');
      writeFileSync(bridge, "export { runUseCase as run } from '@showtime/shared/kernel';\n");
      for (const consumer of [domain, pure, otherUtility]) {
        const reference = path.relative(path.dirname(path.join(workspace, consumer)), bridge).replace(/\.ts$/, '');
        for (const source of [
          `import { run as execute } from '${reference}';`,
          `import type { run as Run } from '${reference}';`,
          `export { run as execute } from '${reference}';`,
          `export type { run as Run } from '${reference}';`,
        ]) assert.ok((await boundaryErrors(consumer, source)).length, source);
      }
      writeFileSync(bridge, "export { ok as run } from '@showtime/shared/kernel';\n");
      for (const consumer of [domain, pure, otherUtility]) {
        const reference = path.relative(path.dirname(path.join(workspace, consumer)), bridge).replace(/\.ts$/, '');
        assert.deepEqual(await boundaryErrors(consumer, `import { run as execute } from '${reference}';`), []);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it('Shared classification remains pure', async () => {
    const visited = new Set<string>();
    assert.equal(reachesFramework('@showtime/shared/kernel', path.join(workspace, domain), ['ErrorKindEnum'], visited), false);
    const enumFile = path.join(workspace, 'libs/shared/kernel/src/lib/enums/error-kind/error-kind.enum.ts');
    assert.ok(visited.has(`${enumFile}:ErrorKindEnum`));
    assert.ok([...visited].every(key => key.startsWith(path.join(workspace, 'libs/shared/kernel/src/'))));
    const implementationDependencies = new Set<string>();
    assert.equal(reachesFramework('./lib/enums/error-kind/error-kind.enum', path.join(workspace, 'libs/shared/kernel/src/index.ts'), ['ErrorKindEnum'], implementationDependencies), false);
    assert.deepEqual([...implementationDependencies], [`${enumFile}:ErrorKindEnum`]);
    assert.deepEqual(await boundaryErrors(domain, "import { ErrorKindEnum } from '@showtime/shared/kernel';"), []);
  });
  it('rejects Angular symbols re-exported through a workspace intermediary', async () => {
    const directory = mkdtempSync(path.join(workspace, 'tools/lint/kernel-fixture-'));
    try {
      const intermediary = path.join(directory, 'bridge.ts');
      writeFileSync(intermediary, "export { CLOCK as clock } from '@showtime/shared/kernel';\n");
      assert.equal(reachesFramework('./bridge', path.join(directory, 'consumer.ts'), ['clock']), true);
      const reference = path.relative(path.dirname(path.join(workspace, domain)), intermediary).replace(/\.ts$/, '');
      assert.ok((await boundaryErrors(domain, `import { clock } from '${reference}';`)).length);
      assert.ok((await boundaryErrors(domain, `export { clock as timeSource } from '${reference}';`)).length);

      writeFileSync(intermediary, "export { fixedClock as clock } from '@showtime/shared/kernel';\n");
      assert.deepEqual(await boundaryErrors(domain, `import { clock } from '${reference}';`), []);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  const from = path.join(workspace, domain);
  for (const name of ['Clock', 'fixedClock', 'systemClock', 'DomainError', 'DomainEvent', 'Id', 'OperationStatus', 'Result']) {
    it(`${name} reaches no framework dependency`, () => {
      assert.equal(reachesFramework('@showtime/shared/kernel', from, [name]), false);
    });
  }
  for (const name of ['CLOCK', 'UseCaseCall', 'runUseCase']) {
    it(`${name} transitively reaches Angular`, () => {
      assert.equal(reachesFramework('@showtime/shared/kernel', from, [name]), true);
    });
  }
  it('keeps one implementation and colocated spec per contract', () => {
    for (const name of ['clock', 'domain-error', 'domain-event', 'id', 'operation-status', 'result', 'use-case-call']) {
      const root = path.join(workspace, 'libs/shared/kernel/src/lib');
      for (const suffix of ['.ts', '.spec.ts']) {
        assert.ok(existsSync(path.join(root, 'types', name, name + suffix)));
        assert.equal(existsSync(path.join(root, name + suffix)), false);
        assert.equal(existsSync(path.join(root, name, name + suffix)), false);
      }
    }
    assert.equal(existsSync(path.join(workspace, 'libs/shared/kernel/src/angular/index.ts')), false);
  });
});
