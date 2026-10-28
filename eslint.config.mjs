import nx from '@nx/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';
// eslint-disable-next-line unicorn/name-replacements -- exported name of the rules module
import { depConstraints } from './eslint.depconstraints.mjs';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/tmp/**'
    ],
  },

  // Рекомендуемые правила для поиска багов и улучшения кода
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],

  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints,
        },
      ],

      // Настройка SonarJS (снижаем строгость когнитивной сложности, если нужно)
      'sonarjs/cognitive-complexity': ['error', 15],

      // Настройка Unicorn (отключаем слишком агрессивные правила)
      'unicorn/prevent-abbreviations': 'off', // Разрешает сокращения вроде "err", "props"
      'unicorn/filename-case': ['error', { 'case': 'kebabCase' }], // Все файлы в kebab-case
      'unicorn/no-null': 'off', // Разрешает использовать null (часто нужен в Angular/Forms)
    },
  },

  // Отключает правила ESLint, которые конфликтуют с Prettier.
  // ВАЖНО: Этот конфиг всегда должен быть самым последним в массиве!
  eslintConfigPrettier,
];
