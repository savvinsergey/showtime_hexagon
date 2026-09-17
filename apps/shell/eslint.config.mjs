import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import ngrx from '@ngrx/eslint-plugin';
import rxjsX from 'eslint-plugin-rxjs-x'; // Импортируем новый x-плагин
import importX from 'eslint-plugin-import-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwind from 'eslint-plugin-tailwindcss';
import jsdoc from 'eslint-plugin-jsdoc';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

import baseConfig from '../../eslint.config.mjs'; // Проверьте расширение базового конфига

export default tseslint.config(
  ...baseConfig,

  // Подключаем пресеты плагинов. Все они теперь нативно используют projectService!
  importX.flatConfigs.typescript,
  ...angular.configs.tsRecommended,

  ...ngrx.configs.store,
  ...ngrx.configs.effects,
  ...ngrx.configs.componentStore,
  ...ngrx.configs.operators,
  ...ngrx.configs.signals,

  // ЕДИНЫЙ БЛОК НАСТРОЕК TS-КОДА
  {
    files: ['**/*.ts'],
    plugins: {
      'rxjs-x': rxjsX, // Регистрируем новый плагин
      'simple-import-sort': simpleImportSort,
      tailwindcss: tailwind,
      jsdoc: jsdoc,
    },
    languageOptions: {
      parserOptions: {
        // Абсолютный и бесконфликтный стандарт Angular v22
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['../../tsconfig.base.json'],
        }),
      ],
      tailwindcss: {
        cssConfigPath: '../../libs/shared/styles/src/global.scss',
        whitelist: ['hlm-.*'],
      },
    },
    rules: {
      // Правила RxJS из нового плагина (синтаксис 'rxjs-x/...')
      'rxjs-x/no-floating-observables': 'error',
      'rxjs-x/no-ignored-subscription': 'warn',

      // Правила Tailwind
      ...tailwind.configs.recommended.rules,
      'tailwindcss/no-custom-classname': 'off',

      // Контроль импортов и циклических зависимостей
      'import-x/no-cycle': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^zone.js', '^reflect-metadata'],
            ['^@angular', '^@ngrx', '^rxjs', String.raw`^@?\w`],
            ['^@showtime/'],
            [String.raw`^\w`],
            [String.raw`^\.\.(?!/?$)`],
            [String.raw`^\./(?=.*/)(?!/?$)`, String.raw`^\.(?!/?$)`, String.raw`^\./$`],
            [String.raw`^.+\.s?css$`],
            ['^.*\u{0}$'],
          ],
        },
      ],
      '@angular-eslint/component-class-suffix': [
        'warn',
        {
          suffixes: ['Component', 'Container', 'Page'],
        },
      ],

      // Документация JSDoc
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: { ClassDeclaration: true, FunctionDeclaration: true, MethodDefinition: true },
          contexts: ['ClassDeclaration[decorators]'],
        },
      ],
      'jsdoc/require-description': ['warn', { contexts: ['any'] }],
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/no-types': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
    },
  },

  // НАСТРОЙКА HTML-ШАБЛОНОВ ANGULAR
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    plugins: {
      tailwindcss: tailwind,
    },
    settings: {
      tailwindcss: {
        cssConfigPath: '../../libs/shared/styles/src/global.scss',
        whitelist: ['hlm-.*'],
      },
    },
    rules: {
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      ...tailwind.configs.recommended.rules,
      'tailwindcss/no-custom-classname': 'off',
    },
  },
);
