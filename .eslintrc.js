
module.exports = {
    env: {
      browser: false,
      es6: true,
      node: true,
      mocha: true,
      jest: true,
    },
    extends: [
      'airbnb-base',
      "eslint:recommended",
      "plugin:chai-friendly/recommended",
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: ['chai-friendly'],
    rules: {
      'max-classes-per-file': 'off',
      'no-underscore-dangle': 'off',
      'no-console': 'off',
      'no-unused-expressions':0,
      'no-shadow': 'off',
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
    },
    overrides:[
      {
        files: ['*.js'],
        excludedFiles: 'babel.config.js',
      },
    ],
};