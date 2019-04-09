const chalk = require('chalk');
const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');
const os = require('os');

const bitcoinjs = require('bitcoinjs-lib-c0ban');
const globalConfigPath = path.join(os.tmpdir(), 'globalConfig.json');

const Client = require('bitcoin-core');
const C0banparty = require('./lib/c0banparty');
// const request = require('request')

class C0banEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    console.log(chalk.yellow('Setup c0ban Environment.'));

    const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    // rpc setup
    var client = new Client({
      network: 'regtest',
      host: globalConfig.c0banHost,
      port: globalConfig.c0banRpcPort,
      username: globalConfig.c0banUser,
      password: globalConfig.c0banPass,
      timeout: 30000,
    });

    this.global.__C0BAN_CLIENT__ = client;
    var apiUrl =
      'http://' + globalConfig.counterblockHost + ':' + globalConfig.counterblockPort;
    this.global.__HOLDER_ADDRESS__ = globalConfig.holderAddress;
    this.global.__NON_HOLDER_ADDRESS__ = globalConfig.nonHolderAddress;
    this.global.__C0BAN_PARTY__ = new C0banparty(
        apiUrl,
        globalConfig.testAddress,
        globalConfig.testPublickey,
        bitcoinjs.ECPair.fromWIF(globalConfig.testPrivatekey, bitcoinjs.networks.regtest),
        client
      );
  }

  async teardown() {
    console.log(chalk.yellow('Teardown Test Environment.'));
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = C0banEnvironment;
