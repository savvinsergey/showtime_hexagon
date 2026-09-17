/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: "avoid",

  // Подключаем плагин автоматической сортировки классов Tailwind v4
  plugins: ['prettier-plugin-tailwindcss'],

  // Указываем Prettier, где брать метаданные вашей темы v4
  tailwindStylesheet: './libs/shared/styles/src/global.scss',
};
