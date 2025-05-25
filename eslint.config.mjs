import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended', eslintConfigPrettier],
    rules: {
      semi: ['error', 'always'],
      'no-var': 'error',
      indent: ['warn', 2],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-unused-private-class-members': 'warn'
    },
    languageOptions: {
      sourceType: 'module',
      globals: globals.browser
    }
  },
  {
    files: ['{webpack,babel}.*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'no-var-requires': 'off'
    }
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
  {
    files: ['package-lock.json'],
    rules: {
      'json/no-empty-keys': 'off'
    }
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended']
  },
  {
    overrides: [
      {
        files: ['tests/**/*'],
        env: {
          jest: true
        }
      }
    ]
  }
]);
