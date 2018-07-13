module.exports = {
  extends: [
    'node-style-guide',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
    'eslint:recommended'
  ],
  plugins: ['prettier'],
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  settings: {},
  globals: {
    logger: false
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        printWidth: 100
      }
    ],
    'no-console': 0,
    'no-new': 0,
    'no-nested-ternary': 0,
    'no-underscore-dangle': 0,
    'import/prefer-default-export': 0,
    'import/no-dynamic-require': 0,
    'array-callback-return': 1,
    'no-return-assign': 0,
    'no-param-reassign': 0,
    'global-require': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false
      }
    ]
  }
};
