const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

// ESLint config for Next.js with ESLint 9
// Note: eslint-config-next is not yet fully compatible with ESLint 9
// This config uses typescript-eslint v8 which supports ESLint 9
module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.config.{js,mjs,ts}',
      'next-env.d.ts',
      '**/generated/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Basic rules - can be extended when eslint-config-next supports ESLint 9
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    },
  }
);

