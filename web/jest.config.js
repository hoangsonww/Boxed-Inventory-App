/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  transformIgnorePatterns: [
    // if you ever need to transform any node_modules, you can tweak this
    '/node_modules/'
  ],
  // If your code uses ESM-only deps, you might also need:
  // extensionsToTreatAsEsm: ['.ts', '.tsx']
};
