module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 代码质量规则
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
    'no-undef': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',

    // 代码风格规则
    'indent': ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    'comma-spacing': 'error',

    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'radix': 'error',
    'wrap-iife': ['error', 'inside'],
    'yoda': 'error',
    'no-param-reassign': ['error', { props: true }],
    'no-return-assign': 'error',
    'no-useless-return': 'error',
    'require-await': 'error',
    'no-promise-executor-return': 'error',

    // 错误预防
    'no-cond-assign': 'error',
    'no-constant-condition': 'warn',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-ex-assign': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-sparse-arrays': 'error',
    'no-unreachable': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    'no-unsafe-optional-chaining': 'error',
    'no-unused-private-class-members': 'error',
    'no-template-curly-in-string': 'error'
  },
  globals: {
    // 浏览器全局变量
    'document': 'readonly',
    'window': 'readonly',
    'console': 'readonly',
    'localStorage': 'readonly',
    'navigator': 'readonly',
    'location': 'readonly',
    'history': 'readonly',
    'setTimeout': 'readonly',
    'clearTimeout': 'readonly',
    'setInterval': 'readonly',
    'clearInterval': 'readonly',
    'fetch': 'readonly',
    'URL': 'readonly',
    'Blob': 'readonly',
    'FormData': 'readonly',
    'AbortController': 'readonly',
    'AbortSignal': 'readonly',

    // Node.js 全局变量
    'require': 'readonly',
    'module': 'readonly',
    'exports': 'readonly',
    'process': 'readonly',
    'Buffer': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly',
    'global': 'readonly'
  }
};
