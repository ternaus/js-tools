'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-function-default-props');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-function-default-props', rule, {
  valid: [
    'function Button({ size = "medium" }) { return <button data-size={size} />; }',
    'const config = {}; config.defaultProps = { size: "medium" };',
    `
      import React from 'react';
      class Button extends React.Component {
        static defaultProps = { size: 'medium' };
      }
    `,
  ],
  invalid: [
    {
      code: 'function Button({ size }) { return <button data-size={size} />; } Button.defaultProps = { size: "medium" };',
      errors: [{ messageId: 'defaultProps' }],
    },
    {
      code: 'const Button = ({ size }) => <button data-size={size} />; Button.defaultProps = { size: "medium" };',
      errors: [{ messageId: 'defaultProps' }],
    },
  ],
});
