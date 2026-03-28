module.exports = {
  env: { node: true, es2021: true, jest: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};
