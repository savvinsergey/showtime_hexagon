import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import { pureConventions } from '../../../eslint.conventions.mjs';

export default [
  // Angular presets only register the plugins that the shared conventions reference; the kernel stays framework-free.
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  // Framework-free layer: `@angular/*` and `rxjs` imports are forbidden.
  ...pureConventions,
];
