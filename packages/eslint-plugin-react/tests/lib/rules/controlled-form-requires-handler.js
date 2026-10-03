'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/controlled-form-requires-handler');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('controlled-form-requires-handler', rule, {
  valid: [
    "import React from 'react'; React.createElement('input', { value: 'x', ['onChange']: change });",
    "import React from 'react'; React.createElement('input', { value: 'x', [handler]: change });",
    '<input {...{value: "x", ["onChange"]: change}} />',
    "import { createElement } from 'react'; createElement = other; createElement('input', { value: 'name' });",
    '<input value="name" onChange={setName} />',
    '<input value="name" onInput={setName} />',
    '<input value="name" readOnly />',
    '<input value="name" disabled />',
    '<input value={null} />',
    '<input type="button" value="Save" />',
    '<textarea value="note" onInput={setNote} />',
    '<select value="one" disabled />',
    '<input type="checkbox" checked onChange={setChecked} />',
    '<input type="checkbox" checked readOnly />',
    '<input type="checkbox" checked disabled />',
    '<input type="checkbox" checked={null} />',
    '<Input value="name" />',
    '<View value="name" />',
    '<input {...props} value="name" />',
    "import React from 'react'; React.createElement('input', { value: 'name', onChange: setName });",
    "import { createElement } from 'react'; createElement('textarea', { value: 'note', readOnly: true });",
    "React.createElement('input', { value: 'name' });",
  ],
  invalid: [
    {
      code: "import React from 'react'; React.createElement('input', { ['value']: 'x' });",
      errors: [{ messageId: 'missingValueHandler' }],
    },
    {
      code: '<input value="name" />',
      errors: [{ messageId: 'missingValueHandler' }],
    },
    {
      code: '<input type="checkbox" checked onInput={setChecked} />',
      errors: [{ messageId: 'missingCheckedHandler' }],
    },
    {
      code: '<select value="one" defaultValue="two" onChange={setValue} />',
      errors: [{ messageId: 'valueDefaultValue' }],
    },
    {
      code: '<textarea value="note" defaultValue="draft" onChange={setValue} />',
      errors: [{ messageId: 'valueDefaultValue' }],
    },
    {
      code: '<input checked defaultChecked onChange={setChecked} />',
      errors: [{ messageId: 'checkedDefaultChecked' }],
    },
    {
      code: "import React from 'react'; React.createElement('input', { checked: true });",
      errors: [{ messageId: 'missingCheckedHandler' }],
    },
  ],
});
