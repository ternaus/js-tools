'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/jsx-no-key-after-spread');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('jsx-no-key-after-spread', rule, {
  valid: [
    '<Row key={row.id} {...props} />',
    '<Row key={row.id} />',
    '<Row {...props} />',
    '<Row {...props} data-key={row.id} />',
  ],
  invalid: [
    {
      code: '<Row {...props} key={row.id} />',
      errors: [{ messageId: 'keyAfterSpread' }],
    },
    {
      code: '<Row first {...firstProps} second {...secondProps} key={row.id} />',
      errors: [{ messageId: 'keyAfterSpread' }],
    },
  ],
});
