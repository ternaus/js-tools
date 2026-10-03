'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/prefer-use-state-lazy-initialization');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('prefer-use-state-lazy-initialization', rule, {
  valid: [
    "import { useState } from 'react'; useState = other; useState(buildValue());",
    {
      code: "import { useState } from 'react'; function App() { const [value] = useState(() => readInitialValue()); return value; }",
    },
    {
      code: 'function useState(value) { return [value]; } const [value] = useState(readInitialValue());',
    },
    {
      code: "import { useState } from 'react'; const [value] = useState({ formatter: () => createFormatter() });",
    },
  ],
  invalid: [
    {
      code: "import { useState as state } from 'react'; const [value] = state(readInitialValue());",
      errors: [{ messageId: 'useLazyInitialization' }],
    },
    {
      code: "import * as React from 'react'; const [value] = React.useState(createInitialValue());",
      errors: [{ messageId: 'useLazyInitialization' }],
    },
    {
      code: "const { useState } = require('react'); const [value] = useState({ todos: createTodos() });",
      errors: [{ messageId: 'useLazyInitialization' }],
    },
  ],
});
