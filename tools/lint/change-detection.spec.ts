import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: fileURLToPath(new URL('../../', import.meta.url)), fix: true });
const fixturePaths = [
  'libs/shared/ui/src/lib/query-state/query-state.ts',
  'libs/layout/ui/src/lib/components/presentational/header/header.component.ts',
  'apps/shell/src/app/app.ts',
];

/** Check each owned project config, including fixes, against the in-memory component. */
async function expectLintToPreserve(source: string) {
  for (const filePath of fixturePaths) {
    const [result] = await eslint.lintText(source, { filePath });
    assert.deepEqual(result.messages, [], filePath);
    assert.equal(result.output ?? source, source, filePath);
  }
}

describe('Owned components use Angular 22 default change detection', () => {
  it('Scenario: Owned component omits redundant metadata', async () => {
    await expectLintToPreserve(`
import { Component } from '@angular/core';
/**
 * Displays the default change detection fixture.
 */
@Component({ selector: 'st-fixture', standalone: true, template: '' })
export class FixtureComponent {}
`);
  });

  it('Scenario: Explicit strategy override is preserved', async () => {
    await expectLintToPreserve(`
import { ChangeDetectionStrategy, Component } from '@angular/core';
/**
 * Displays the explicit change detection fixture.
 */
@Component({
  selector: 'st-fixture',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FixtureComponent {}
`);
  });
});
