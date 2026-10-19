import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', '.local/**', '.agents/**', '.claude/**'] },
  js.configs.recommended,
  { files: ['**/*.mjs'], languageOptions: { globals: globals.node } },
];
