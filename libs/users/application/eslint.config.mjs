import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import { conventions } from '../../../eslint.conventions.mjs';

const boundaryRule = baseConfig.find(config => config.rules?.['@nx/enforce-module-boundaries'])
  .rules['@nx/enforce-module-boundaries'];

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  ...conventions,
  {
    files: ['**/*.spec.ts', '**/mock/**/*.ts'],
    rules: {
      // The test-only secondary entry belongs to this project; retain all other boundary options.
      '@nx/enforce-module-boundaries': [boundaryRule[0], {
        ...boundaryRule[1],
        allow: [...boundaryRule[1].allow, '^@showtime/users/application/mock$'],
      }],
    },
  },
];
