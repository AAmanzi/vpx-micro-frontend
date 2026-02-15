module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'no-extra-semi': 'warn',
    'newline-after-var': ['warn', 'always'],
    'newline-before-return': 'warn',
    'no-console': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'padding-line-between-statements': [
      'warn',
      {
        blankLine: 'always',
        prev: '*',
        next: 'if',
      },
      {
        blankLine: 'any',
        prev: 'block',
        next: 'if',
      },
      {
        blankLine: 'always',
        prev: 'if',
        next: '*',
      },
      {
        blankLine: 'any',
        prev: 'if',
        next: 'block',
      },
      {
        blankLine: 'always',
        prev: 'export',
        next: '*',
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/order': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/array-type': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
