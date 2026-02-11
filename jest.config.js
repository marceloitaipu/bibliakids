module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules)/)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/state/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  // Ignore React Native setup
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/react-native/jest',
  ],
};
