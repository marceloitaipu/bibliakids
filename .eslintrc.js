/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['expo', 'plugin:react-hooks/recommended'],
  plugins: ['react-hooks'],
  rules: {
    // Garantir que deps de hooks estejam corretos
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Sem console.log solto (usar logger.ts)
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Evitar 'as any'
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ['node_modules/', 'babel.config.js', 'jest.config.js', 'jest.setup.js'],
};
