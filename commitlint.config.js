module.exports = {
  // Наследуем базовые типы коммитов: feat, fix, chore, docs, refactor, style, test и др.
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Регистр для типа коммита (всегда lower-case: feat:, fix:)
    'type-case': [2, 'always', 'lowercase'],
    // Запрещаем пустой тип коммита
    'type-empty': [2, 'never'],
    // Максимальная длина строки заголовка — 100 символов
    'header-max-length': [2, 'always', 100],
    // Текст сообщения не должен начинаться с заглавной буквы
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // Точка в конце заголовка запрещена
    'subject-full-stop': [2, 'never', '.'],

    "type-enum": [
      2,
      "always",
      ["ci", "chore", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "build"]
    ]
  },
};
