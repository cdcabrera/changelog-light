module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/.*/**',
    '!src/logger/*'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 85,
      statements: 85
    }
  },
  projects: [
    {
      displayName: 'unit',
      roots: ['<rootDir>/src'],
      testMatch: ['<rootDir>/src/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setupTests.js']
    },
    {
      displayName: 'e2e',
      roots: ['<rootDir>/tests'],
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setupTests.js']
    }
  ]
};
