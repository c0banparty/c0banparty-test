const chalk = require('chalk');
// const puppeteer = require('puppeteer')
// const mkdirp = require('mkdirp')
const fs = require('fs');
const os = require('os');
const path = require('path');
const globalConfigPath = path.join(os.tmpdir(), 'globalConfig.json');

module.exports = async function() {
  const c0banpartyConfig = {
    testAddress: process.env.TEST_ADDRESS ? process.env.TEST_ADDRESS : '',
    testPrivatekey: process.env.TEST_PRIVATEKEY ? process.env.TEST_PRIVATEKEY : '',
    testPublickey: process.env.TEST_PUBLICKEY ? process.env.TEST_PUBLICKEY : '',
    holderAddress: process.env.HOLDER_ADDRESS ? process.env.HOLDER_ADDRESS : '',
    holderPrivatekey: process.env.HOLDER_PRIVATEKEY ? process.env.HOLDER_PRIVATEKEY : '',
    nonHolderAddress: process.env.NON_HOLDER_ADDRESS ? process.env.NON_HOLDER_ADDRESS : '',
    nonHolderPrivatekey: process.env.NON_HOLDER_PRIVATEKEY ? process.env.NON_HOLDER_PRIVATEKEY : '',
    c0banHost: process.env.C0BAN_HOST ? process.env.C0BAN_HOST : 'localhost',
    c0banRpcPort: process.env.C0BAN_RPC_PORT ? process.env.C0BAN_RPC_PORT : 23882,
    c0banUser: process.env.C0BAN_USER ? process.env.C0BAN_USER : 'test',
    c0banPass: process.env.C0BAN_PASS ? process.env.C0BAN_PASS : 'test',
    counterblockHost: process.env.COUNTERBLOCK_HOST ? process.env.COUNTERBLOCK_HOST : 'localhost',
    counterblockPort: process.env.COUNTERBLOCK_PORT ? process.env.COUNTERBLOCK_PORT : 24100,
    webHost: process.env.WEB_HOST ? process.env.WEB_HOST : 'localhost',
  };

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(c0banpartyConfig));
};
