module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },

  // 🔥 THIS is the important part: disable babel-jest completely
  transformIgnorePatterns: [
    '/node_modules/',
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  moduleFileExtensions: ['ts', 'js', 'json'],

  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ]
};