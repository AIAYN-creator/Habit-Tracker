import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Fronteras de arquitectura (docs/stack.md):
      // - una feature no importa de otra feature
      // - data no importa de features ni de ui
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/entry',
              from: './src/features',
              except: ['./entry'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/features/schema',
              from: './src/features',
              except: ['./schema'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/features/history',
              from: './src/features',
              except: ['./history'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/features/charts',
              from: './src/features',
              except: ['./charts'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/features/theme',
              from: './src/features',
              except: ['./theme'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/features/sync',
              from: './src/features',
              except: ['./sync'],
              message: 'Una feature no puede importar de otra feature. Sube lo comun a ui/ o lib/.',
            },
            {
              target: './src/data',
              from: './src/features',
              message: 'data/ es la capa de abajo: no puede importar de features/.',
            },
            {
              target: './src/data',
              from: './src/ui',
              message: 'data/ es la capa de abajo: no puede importar de ui/.',
            },
          ],
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // Ruido en tests, no señal: un doble que devuelve una promesa no
      // necesita await, y las aserciones de vitest reciben el metodo suelto
      // a proposito.
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    // Ficheros de configuracion en JS: sin reglas que exijan tipos.
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
