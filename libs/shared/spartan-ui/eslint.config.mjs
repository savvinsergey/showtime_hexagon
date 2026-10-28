import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'hlm', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'hlm', style: 'kebab-case' }],
    },
  },
  {
    // The barrel re-exports the hidden helm sub-libs via `@spartan-ng/helm/*` aliases
    // (ADR-0001, design.md hidden-sub-libs note); they belong to this project now.
    files: ['**/spartan-ui/src/index.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
