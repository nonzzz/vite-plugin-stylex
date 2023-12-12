const { nonzzz } = require('eslint-config-kagura')
const parserVue = require('vue-eslint-parser')
const parserTs = require('@typescript-eslint/parser')
const pluginVue = require('eslint-plugin-vue')

module.exports = nonzzz({ ts: true, jsx: true, unusedImports: false, react: true }, { ignores: ['dist', 'node_modules', 'public', 'viteUtil'],
  plugins: {
    vue: pluginVue
  },
  files: ['**/*.vue'],
  languageOptions: {
    parser: parserVue,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      extraFileExtensions: ['.vue'],
      parser: parserTs,
      sourceType: 'module'
    }
  },
  processor: pluginVue.processors['.vue'],
  rules: {
    ...pluginVue.configs.base.rules,
    ...pluginVue.configs.recommended.rules,
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-options-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots']
    }],
    'vue/dot-location': ['error', 'property'],
    'vue/dot-notation': ['error', { allowKeywords: true }],
    'vue/eqeqeq': ['error', 'smart'],
    'vue/html-indent': ['error', 2],
    'vue/html-quotes': ['error', 'double'],
    'vue/max-attributes-per-line': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-dupe-keys': 'off',
    'vue/no-empty-pattern': 'error',
    'vue/no-extra-parens': ['error', 'functions'],
    'vue/no-irregular-whitespace': 'error',
    'vue/no-loss-of-precision': 'error',
    'vue/no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    'vue/no-restricted-v-bind': ['error', '/^v-/'],
    'vue/no-setup-props-reactivity-loss': 'off',
    'vue/no-sparse-arrays': 'error',
    'vue/no-unused-refs': 'error',
    'vue/no-useless-v-bind': 'error',
    'vue/no-v-html': 'off',
    'vue/object-shorthand': [
      'error',
      'always',
      {
        avoidQuotes: true,
        ignoreConstructors: false
      }
    ],
    'vue/prefer-separate-static-class': 'error',
    'vue/prefer-template': 'error',
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/space-infix-ops': 'error',
    'vue/space-unary-ops': ['error', { nonwords: false, words: true }],
    'vue/array-bracket-spacing': ['error', 'never'],
    'vue/arrow-spacing': ['error', { after: true, before: true }],
    'vue/block-spacing': ['error', 'always'],
    'vue/block-tag-newline': ['error', {
      multiline: 'always',
      singleline: 'always'
    }],
    'vue/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
    'vue/comma-dangle': ['error', 'always-multiline'],
    'vue/comma-spacing': ['error', { after: true, before: false }],
    'vue/comma-style': ['error', 'last'],
    'vue/html-comment-content-spacing': ['error', 'always', {
      exceptions: ['-']
    }],
    'vue/key-spacing': ['error', { afterColon: true, beforeColon: false }],
    'vue/keyword-spacing': ['error', { after: true, before: true }],
    'vue/object-curly-newline': 'off',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
    'vue/operator-linebreak': ['error', 'before'],
    'vue/padding-line-between-blocks': ['error', 'always'],
    'vue/quote-props': ['error', 'consistent-as-needed'],
    'vue/space-in-parens': ['error', 'never'],
    'vue/template-curly-spacing': 'error'
  }
})
