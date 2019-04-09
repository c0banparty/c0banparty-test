const chalk = require('chalk')
// const puppeteer = require('puppeteer')
const rimraf = require('rimraf')
const os = require('os')
const path = require('path')

const globalConfigPath = path.join(os.tmpdir(), 'globalConfig.json')

module.exports = async function() {
  console.log(chalk.green('Teardown c0banparty'))
  // await global.__BROWSER__.close()
  rimraf.sync(globalConfigPath)
}