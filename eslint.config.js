import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      jsdoc.configs['flat/recommended-typescript-error'],
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      // Every named function needs a JSDoc block: short description, @param, @returns.
      // Inline callbacks (event handlers, array callbacks) are excluded.
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: { FunctionDeclaration: true, MethodDefinition: true },
          contexts: [
            'Program > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': ['error', { contexts: ['any'] }],
      // Destructured fields (for example component props) are documented in their type.
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/check-param-names': ['error', { checkDestructured: false }],
      'jsdoc/require-returns': 'error',
      'jsdoc/require-hyphen-before-param-description': 'error',
    },
  },
  {
    // Tests describe themselves through test names.
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.ts'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
    },
  },
  prettier,
]);
