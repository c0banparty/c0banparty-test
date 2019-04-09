const axios = require('axios');
const bitcoinjs = require('bitcoinjs-lib-c0ban');
const utils = require('../lib/utils');
const sleepTime = 2000

function C0banparty(apiUrl, address, publicKey, privateKey, c0banClient) {
    this.apiUrl = apiUrl
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.c0banClient = c0banClient
  }

C0banparty.prototype.createBurn = async function (burnQuantity) {
    var response = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
            id: 0,
            jsonrpc: '2.0',
            method: 'proxy_to_counterpartyd',
            params: {
            method: 'create_burn',
            params: {
                pubkey: this.publickey,
                quantity: burnQuantity * 100000000,
                source: this.address
            },
            },
        },
    });
    var unsignedTx = response.data.result
    var signedTx = await this.sign(unsignedTx);
    await this.broadcast(signedTx)
    await this.c0banClient.generate(1);
    console.log(burnQuantity + ' is Burned.');
    await utils.sleep(sleepTime)
}

C0banparty.prototype.createIssuance = async function (assetInfo) {
    var response = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
          id: 0,
          jsonrpc: '2.0',
          method: 'proxy_to_counterpartyd',
          params: {
            method: 'create_issuance',
            params: assetInfo,
          },
        },
      })
    // console.log("createIssuance response", response.data)
    if (response.data.hasOwnProperty('error')) {
        return response.data.error.data.message
    }
    var unsignedTx = response.data.result
    var signedTx = await this.sign(unsignedTx);
    await this.broadcast(signedTx)
    await this.c0banClient.generate(1);
    console.log('createIssuance. asset = '+assetInfo.asset);
    await utils.sleep(sleepTime)
}

C0banparty.prototype.sign = function (unsignedTx) {
    var txObj = new bitcoinjs.TransactionBuilder.fromTransaction (
        bitcoinjs.Transaction.fromHex(unsignedTx), this.privateKey.network)
    txObj.sign(0, this.privateKey)
    return txObj.build().toHex()
}

C0banparty.prototype.broadcast = async function (signedTx) {
    var result = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
          id: 0,
          jsonrpc: '2.0',
          method: 'broadcast_tx',
          params: {
            signed_tx_hex: signedTx
          },
        },
      })
    return result.data
}

C0banparty.prototype.getAssetInfo = async function (assetName) {
    var result = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
          id: 0,
          jsonrpc: '2.0',
          method: 'get_assets_info',
          params: {
            assetsList: [assetName]
          },
        },
      })
    // console.log("getAssetInfo", assetName, result.data.result)
    var assets = result.data.result;
    if (assets.length > 0) return assets[0]
    return null
}

C0banparty.prototype.getUserAssetBalance = async function (asset) {
    var result = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
          id: 0,
          jsonrpc: '2.0',
          method: 'get_balance_history',
          params: {
            asset: asset,
            addresses: [this.address]
          },
        },
      })
    var history = result.data.result[0].data
    if (history.length === 0) return []
    return history[history.length - 1][1]
}

C0banparty.prototype.getUserRyoBalance = async function (address = null) {
    var address = address ? address : this.address
    var result = await axios({
        method: 'post',
        url: this.apiUrl,
        data: {
            id: 0,
            jsonrpc: '2.0',
            method: 'get_chain_address_info',
            params: {
                addresses: [this.address],
                with_last_txn_hashes: 5,
                with_uxtos: true,
            },
        },
    });
    return result.data.result[0]['info']['balance'];
}

C0banparty.prototype.sendRyoThresholdExceeded = async function (addresses, threshohld = 0) {
  // console.log("sendRyoThresholdExceeded", addresses, threshohld);
  for (let index = 0; index < addresses.length; index++) {
      const address = addresses[index];
      var balance = await this.getUserRyoBalance(address)
      console.log("RYO address, balance", address, balance);
      if (balance < threshohld) {
          var txid = await this.c0banClient.sendToAddress(address, threshohld);
          await this.c0banClient.generate(1);
          console.log('Balance = ' + balance + '. send 100RYO. txid = ' + txid);
          await utils.sleep(sleepTime)
      }
    }
}

module.exports = C0banparty