import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import nx from '@nx/eslint-plugin';
import { ESLint } from 'eslint';

import {
  conventions,
  infrastructureConventions,
  pureConventions,
} from '../../eslint.conventions.mjs';

const RULE_ID = 'no-restricted-imports';
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const REGULAR_FILE = 'libs/sample/src/lib/sample.ts';
const SPEC_FILE = 'libs/sample/src/lib/sample.spec.ts';
const MOCK_FILE = 'libs/sample/src/lib/mock/fake.ts';
const MOCK_IMPORT =
  "import { fakePort } from '@showtime/users/application/mock';\nexport const port = fakePort;\n";

/**
 * Lints an inline source with the given conventions variant, using the same Angular presets as the
 * library `eslint.config.mjs` files, so TypeScript parsing and plugins match real projects.
 *
 * @param {readonly object[]} variant One of the exported conventions arrays.
 * @param {string} source Inline TypeScript source.
 * @param {string} [filePath] Workspace-relative virtual path (decides the `*.spec.ts` and `mock/` exemptions).
 * @returns {Promise<string>} Only `no-restricted-imports` findings as `<ruleId>: <message>` lines (empty when accepted).
 * Fails the test when ESLint reports a fatal message or a message without a rule (parse/config errors).
 */
const lint = async (variant, source, filePath = REGULAR_FILE) => {
  const eslint = new ESLint({
    cwd: workspaceRoot,
    overrideConfigFile: true,
    overrideConfig: [
      ...nx.configs['flat/angular'],
      ...nx.configs['flat/angular-template'],
      ...nx.configs['flat/typescript'],
      ...variant,
    ],
  });
  const [result] = await eslint.lintText(source, { filePath });
  const broken = result.messages.filter(({ fatal, ruleId }) => fatal || ruleId === null);
  assert.deepEqual(
    broken,
    [],
    `Lint run is broken (parse error or config problem): ${JSON.stringify(broken)}`,
  );
  return result.messages
    .filter(({ ruleId }) => ruleId === RULE_ID)
    .map(({ ruleId, message }) => `${ruleId}: ${message}`)
    .join('\n');
};

describe('conventions: @ngrx', () => {
  const signals =
    "import { signalStore } from '@ngrx/signals';\nexport const store = signalStore;\n";
  const store = "import { Store } from '@ngrx/store';\nexport const store = Store;\n";

  it('rejects @ngrx/signals by default', async () => {
    assert.match(
      await lint(conventions, signals),
      /@ngrx\/signals is allowed only in `infrastructure\/state`/,
    );
  });

  it('allows @ngrx/signals in the infrastructure variant', async () => {
    assert.equal(await lint(infrastructureConventions, signals), '');
  });

  it('rejects @ngrx/signals subpaths by default and allows them in the infrastructure variant', async () => {
    const source =
      "import { withState } from '@ngrx/signals/entities';\nexport const feature = withState;\n";
    assert.match(await lint(conventions, source), /@ngrx\/signals is allowed only/);
    assert.equal(await lint(infrastructureConventions, source), '');
  });

  it('rejects @ngrx/store in both variants', async () => {
    assert.match(await lint(conventions, store), /@ngrx\/signals is allowed only/);
    assert.match(await lint(infrastructureConventions, store), /@ngrx\/signals is allowed only/);
  });
});

describe('conventions: spartan helm', () => {
  it('rejects a direct helm import', async () => {
    const source =
      "import { HlmButton } from '@spartan-ng/helm/button';\nexport const button = HlmButton;\n";
    assert.match(await lint(conventions, source), /only from `@shared\/spartan-ui`/);
  });

  it('accepts the @shared/spartan-ui import', async () => {
    const source =
      "import { HlmButton } from '@shared/spartan-ui';\nexport const button = HlmButton;\n";
    assert.equal(await lint(conventions, source), '');
  });
});

describe('conventions: port mocks', () => {
  const source =
    "import { fakePort } from '@showtime/users/application/mock';\nexport const port = fakePort;\n";

  it('rejects the mock import in a regular file', async () => {
    assert.match(await lint(conventions, source), /Port mocks \(`application\/mock`\)/);
  });

  it('accepts the mock import in a spec file', async () => {
    assert.equal(await lint(conventions, source, 'libs/sample/src/lib/sample.spec.ts'), '');
  });

  it('accepts the mock import in a mock folder', async () => {
    assert.equal(await lint(conventions, source, 'libs/sample/src/lib/mock/fake.ts'), '');
  });

  it('keeps ngrx and helm restrictions in spec files', async () => {
    const ngrx = "import { Store } from '@ngrx/store';\nexport const store = Store;\n";
    const helm =
      "import { HlmButton } from '@spartan-ng/helm/button';\nexport const button = HlmButton;\n";
    assert.match(await lint(conventions, ngrx, SPEC_FILE), /@ngrx\/signals is allowed only/);
    assert.match(await lint(conventions, helm, SPEC_FILE), /only from `@shared\/spartan-ui`/);
  });
});

describe('infrastructureConventions: spec/mock override block', () => {
  const signals =
    "import { signalStore } from '@ngrx/signals';\nexport const store = signalStore;\n";
  const store = "import { Store } from '@ngrx/store';\nexport const store = Store;\n";

  it('still allows @ngrx/signals in spec and mock files', async () => {
    assert.equal(await lint(infrastructureConventions, signals, SPEC_FILE), '');
    assert.equal(await lint(infrastructureConventions, signals, MOCK_FILE), '');
  });

  it('still rejects other @ngrx packages in spec and mock files', async () => {
    assert.match(
      await lint(infrastructureConventions, store, SPEC_FILE),
      /@ngrx\/signals is allowed only/,
    );
    assert.match(
      await lint(infrastructureConventions, store, MOCK_FILE),
      /@ngrx\/signals is allowed only/,
    );
  });

  it('accepts the mock import in spec and mock files, rejects it in a regular file', async () => {
    assert.equal(await lint(infrastructureConventions, MOCK_IMPORT, SPEC_FILE), '');
    assert.equal(await lint(infrastructureConventions, MOCK_IMPORT, MOCK_FILE), '');
    assert.match(
      await lint(infrastructureConventions, MOCK_IMPORT),
      /Port mocks \(`application\/mock`\)/,
    );
  });
});

describe('pureConventions', () => {
  const rejectedModules = [
    ['@angular/core', /`@angular\/\*` imports are not allowed/],
    ['@angular/core/rxjs-interop', /`@angular\/\*` imports are not allowed/],
    ['@angular/common', /`@angular\/\*` imports are not allowed/],
    ['rxjs', /`rxjs` imports are not allowed/],
    ['rxjs/operators', /`rxjs` imports are not allowed/],
  ];

  for (const [moduleName, expected] of rejectedModules) {
    it(`rejects ${moduleName}`, async () => {
      const source = `import * as lib from '${moduleName}';\nexport const value = lib;\n`;
      assert.match(await lint(pureConventions, source), expected);
    });
  }

  it('accepts the same imports in the regular variant', async () => {
    const source =
      "import { signal } from '@angular/core';\nimport { of } from 'rxjs';\nexport const value = [signal, of];\n";
    assert.equal(await lint(conventions, source), '');
  });

  it('keeps the base restrictions (merged, not overridden)', async () => {
    const ngrx = "import { Store } from '@ngrx/store';\nexport const store = Store;\n";
    const helm =
      "import { HlmButton } from '@spartan-ng/helm/button';\nexport const button = HlmButton;\n";
    const mock =
      "import { fakePort } from '@showtime/users/application/mock';\nexport const port = fakePort;\n";
    assert.match(await lint(pureConventions, ngrx), /@ngrx\/signals is allowed only/);
    assert.match(await lint(pureConventions, helm), /only from `@shared\/spartan-ui`/);
    assert.match(await lint(pureConventions, mock), /Port mocks \(`application\/mock`\)/);
  });

  it('still rejects @angular/* in spec files', async () => {
    const source = "import { signal } from '@angular/core';\nexport const value = signal;\n";
    assert.match(
      await lint(pureConventions, source, 'libs/sample/src/lib/sample.spec.ts'),
      /`@angular\/\*` imports/,
    );
  });

  it('accepts the mock import in spec and mock files, rejects it in a regular file', async () => {
    assert.equal(await lint(pureConventions, MOCK_IMPORT, SPEC_FILE), '');
    assert.equal(await lint(pureConventions, MOCK_IMPORT, MOCK_FILE), '');
    assert.match(await lint(pureConventions, MOCK_IMPORT), /Port mocks \(`application\/mock`\)/);
  });

  it('still rejects @angular/* and rxjs in mock files', async () => {
    const angular = "import { signal } from '@angular/core';\nexport const value = signal;\n";
    const rxjs = "import { of } from 'rxjs';\nexport const value = of;\n";
    assert.match(await lint(pureConventions, angular, MOCK_FILE), /`@angular\/\*` imports/);
    assert.match(await lint(pureConventions, rxjs, MOCK_FILE), /`rxjs` imports/);
  });

  it('accepts plain workspace and relative imports', async () => {
    const source =
      "import { Result } from '@showtime/shared/kernel';\nimport { local } from './local';\nexport const value = [Result, local];\n";
    assert.equal(await lint(pureConventions, source), '');
  });
});
