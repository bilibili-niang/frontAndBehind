/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': process.env.NODE_ENV ===  'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-unused-vars': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 'off',
    camelcase: 'off',
    'promise/param-names': 'off',
    'vue/no-setup-props-destructure': 'off',
    'vue/multi-word-component-names': 'off',
    // 允许在模板中使用 PascalCase 组件名，例如 <Button>
    'vue/component-name-in-template-casing': 'off',
    // 允许可能被识别为保留名的组件名（如 Button），以便与 UI 库保持一致
    'vue/no-reserved-component-names': 'off'
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true
      }
    }
  ]
}
