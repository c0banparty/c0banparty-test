function createAssetName(length) {
    var assetName = "";
    var possible = "BCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < length; i++)
      assetName += possible.charAt(Math.floor(Math.random() * possible.length));

    return assetName;
  }

async function sleep(msec) {
    return new Promise(function(resolve) {
      setTimeout(function() {resolve()}, msec);
    })
}

module.exports = {
    sleep: sleep,
    createAssetName: createAssetName
  }