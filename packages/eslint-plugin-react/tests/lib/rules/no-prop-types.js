'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-prop-types');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-prop-types', rule, {
  valid: [
    'const schema = { string: true }; schema.propTypes = { label: schema.string };',
    'function NotAComponent() { return null; } NotAComponent.propTypes = {};',
    `
      import React from 'react';
      class NotAComponent {
        static propTypes = {};
      }
    `,
  ],
  invalid: [
    {
      code: 'function Button() { return <button />; } Button.propTypes = { label: PropTypes.string };',
      errors: [{ messageId: 'propTypes' }],
    },
    {
      code: 'const Button = () => <button />; Button.propTypes = { label: PropTypes.string };',
      errors: [{ messageId: 'propTypes' }],
    },
    {
      code: `
        import React from 'react';
        class Button extends React.Component {
          static propTypes = { label: PropTypes.string };
        }
      `,
      errors: [{ messageId: 'propTypes' }],
    },
  ],
});
