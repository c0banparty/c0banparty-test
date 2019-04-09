module.exports = {
    globalSetup: './setup.js',
    globalTeardown: './teardown.js',
    testEnvironment: './c0banparty_environment.js',
    setupFilesAfterEnv: [
      './jest.setup.js'
    ]
  }