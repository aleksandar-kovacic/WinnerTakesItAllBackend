module.exports = {
  testMatch: ['**/*.test.js'],
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  globals: {
    'babel-jest': {
      useESM: true,
    },
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
};
