import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import eslintConfigPrettier from 'eslint-config-prettier'
import type { Linter } from 'eslint'

const config: Linter.Config[] = [
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    {
        ignores: ['**/dist/**']
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        settings: {
            react: {
                version: 'detect'
            }
        }
    },
    pluginReact.configs.flat.recommended as Linter.Config,
    eslintConfigPrettier as Linter.Config,
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off', // We use TypeScript for prop validation
            'react/no-unescaped-entities': 'off' // Allow apostrophes and quotes in JSX
        }
    },
    // Allow CommonJS require in .cjs and .release-it.js files
    {
        files: ['**/*.cjs', '.release-it.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off'
        }
    }
]

export default config
