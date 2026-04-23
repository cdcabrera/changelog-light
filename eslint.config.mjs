import { node, jest } from '@cdcabrera/eslint-config-toolkit';

export default [
  ...node,
  ...jest,
  {
    languageOptions: {
      globals: {
        createGitRepo: 'readonly',
        generateFixture: 'readonly',
        mockObjectProperty: 'readonly'
      }
    },
    rules: {
      'import/no-dynamic-require': 0
    }
  }
];
