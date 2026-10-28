/**
 * Builds the `no-restricted-imports` rule value.
 *
 * @param options - Variant switches.
 * @param options.allowSignals - Allow `@ngrx/signals` imports (infrastructure/state only).
 * @param options.restrictMock - Forbid `@showtime/<context>/application/mock` (allowed only in specs and mock folders).
 * @param options.restrictFramework - Forbid every `@angular/*` and `rxjs` import (framework-free layers).
 * @returns ESLint rule entry.
 */
const restrictedImports = ({ allowSignals, restrictMock, restrictFramework }) => [
  'error',
  {
    paths: [
      {
        name: '@angular/forms',
        importNames: [
          'FormGroup',
          'FormControl',
          'FormArray',
          'FormRecord',
          'FormBuilder',
          'NonNullableFormBuilder',
          'ReactiveFormsModule',
          'FormsModule',
          'NgModel',
          'FormControlName',
          'FormGroupDirective',
          'FormControlDirective',
        ],
        message:
          'Use Angular Signal Forms (`@angular/forms/signals`); reactive and template-driven forms are not allowed.',
      },
      {
        name: '@angular/core/rxjs-interop',
        importNames: ['toSignal', 'toObservable'],
        message:
          'Do not use toSignal()/toObservable(); use signal(), computed(), resource() or rxResource().',
      },
      {
        name: '@angular/common',
        importNames: [
          'CommonModule',
          'NgIf',
          'NgFor',
          'NgForOf',
          'NgSwitch',
          'NgSwitchCase',
          'NgSwitchDefault',
          'AsyncPipe',
        ],
        message:
          'Use built-in control flow (@if/@for/@switch) and signals; CommonModule, NgIf/NgFor and AsyncPipe are not allowed.',
      },
    ],
    patterns: [
      {
        group: ['@spartan-ng/helm/*'],
        message:
          'Import spartan UI only from `@shared/spartan-ui`, never directly from `@spartan-ng/helm/...`.',
      },
      {
        group: ['@ngrx/*', ...(allowSignals ? ['!@ngrx/signals', '!@ngrx/signals/*'] : [])],
        message:
          '@ngrx/signals is allowed only in `infrastructure/state` (depend on the state port, e.g. USERS_STATE).',
      },
      ...(restrictMock
        ? [
            {
              group: ['@showtime/*/application/mock'],
              message:
                'Port mocks (`application/mock`) may be imported only from spec files and other mock folders.',
            },
          ]
        : []),
      // Flat-config rule entries replace each other, so the framework patterns live in this single list.
      ...(restrictFramework
        ? [
            {
              group: ['@angular/*'],
              message:
                'Framework-free layer (domain, kernel): `@angular/*` imports are not allowed.',
            },
            {
              group: ['rxjs', 'rxjs/*'],
              message: 'Framework-free layer (domain, kernel): `rxjs` imports are not allowed.',
            },
          ]
        : []),
    ],
  },
];

/**
 * Project conventions enforced by ESLint (see `.cursor/rules/engineering-conventions.mdc`).
 *
 * Spread this array at the END of an application/library `eslint.config.mjs` (after the Angular presets),
 * e.g. `...conventions`. The generated spartan-ui libraries intentionally do not use it.
 *
 * - All `@ngrx/*` imports are forbidden by default. The only exception: `infrastructureConventions`
 *   (only the `infrastructure/state` libraries) allows `@ngrx/signals` (data SignalStore).
 * - `@showtime/<context>/application/mock` (port mocks for tests) is forbidden everywhere except `*.spec.ts`
 *   files and `**` + `/mock/**` folders.
 *
 * @param options - Variant switches.
 * @param options.allowSignals - Allow `@ngrx/signals` imports (infrastructure/state only).
 * @param options.restrictFramework - Also forbid `@angular/*` and `rxjs` imports (domain and kernel only).
 * @returns Flat ESLint config entries.
 */
const buildConventions = ({ allowSignals = false, restrictFramework = false }) => [
  {
    files: ['**/*.ts'],
    rules: {
      // Signal Forms only; no reactive/template-driven forms, no toSignal()/toObservable().
      'no-restricted-imports': restrictedImports({
        allowSignals,
        restrictMock: true,
        restrictFramework,
      }),
      '@typescript-eslint/no-explicit-any': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    // Specs and mock folders may import port mocks (same rule, without the mock restriction).
    files: ['**/*.spec.ts', '**/mock/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports({
        allowSignals,
        restrictMock: false,
        restrictFramework,
      }),
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/no-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "BindingPipe[name='async']",
          message:
            'The async pipe is not allowed; read signals (signal, computed, resource, rxResource) in templates.',
        },
        {
          selector: "BoundAttribute[name='ngModel']",
          message: 'ngModel is not allowed; use Angular Signal Forms.',
        },
      ],
    },
  },
];

/**
 * Default conventions: all `@ngrx/*` imports are forbidden.
 */
export const conventions = buildConventions({});

/**
 * For `infrastructure/state` libraries: same as `conventions`, but `@ngrx/signals` is allowed.
 */
export const infrastructureConventions = buildConventions({ allowSignals: true });

/**
 * For framework-free layers (`type:domain`, `type:kernel`): same as `conventions`, plus every `@angular/*`
 * (including subpaths such as `@angular/core/rxjs-interop`) and `rxjs` (including `rxjs/operators`) import
 * is forbidden. The restrictions are merged into the same `no-restricted-imports` entry, not layered on top.
 */
export const pureConventions = buildConventions({ restrictFramework: true });
