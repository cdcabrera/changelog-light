import { node, jest } from '@cdcabrera/eslint-config-toolkit';

export default [
  ...node,
  ...jest,
  {
    languageOptions: {
      globals: {
        generateFixture: 'readonly',
        mockObjectProperty: 'readonly',
        setMockResourceFunctions: 'readonly'
      }
    },
    rules: {
      'import/no-dynamic-require': 0
    }
  }
];
