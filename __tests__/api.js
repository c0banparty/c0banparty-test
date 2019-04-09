const utils = require('../lib/utils');

const timeout = 5000;
const supplementRYO = 100;
const supplementXCB = 88;

describe('c0banparty', () => {
  let c0banClient;
  let c0banparty;

  beforeAll(async () => {
    c0banClient = global.__C0BAN_CLIENT__
    c0banparty = global.__C0BAN_PARTY__
    
    // check RYO balance
    var checkAddreses = [
      c0banparty.address, // base address
    ];
    await c0banparty.sendRyoThresholdExceeded(checkAddreses, supplementRYO)

    // burn RYO if insufficient funds XCB
    var balance = await c0banparty.getUserAssetBalance('XCB');
    console.log("XCB balance", balance);
    if (balance < supplementXCB) {
      var burnQuantity = 10
      await c0banparty.createBurn(burnQuantity)
    }
  }, timeout);

  afterAll(async () => {});

  describe('normal', () => {
    let parentAssetInfo
    beforeAll(async () => {
      parentAssetInfo = {
        asset: utils.createAssetName(10),
        pubkey: c0banparty.publicKey,
        quantity: 10000000000,
        source: c0banparty.address,
      }
    }, timeout);

    describe('parent token', () => {
      it('should be created & should lock', async () => {
        await c0banparty.createIssuance(parentAssetInfo);
        var asset = await c0banparty.getAssetInfo(parentAssetInfo.asset);
        expect(asset.asset).toBe(parentAssetInfo.asset)
        
        // lock
        expect(asset.locked).toBeFalsy()
        parentAssetInfo.description = 'LOCK'
        parentAssetInfo.quantity = 0
        await c0banparty.createIssuance(parentAssetInfo);
        var asset = await c0banparty.getAssetInfo(parentAssetInfo.asset);
        console.log('asset.locked', asset.locked)
        expect(asset.locked).toBeTruthy()

        // description
        var description = 'updated'
        parentAssetInfo.description = description
        await c0banparty.createIssuance(parentAssetInfo);
        var asset = await c0banparty.getAssetInfo(parentAssetInfo.asset);
        expect(asset.description).toBe(description)
      });
    });

    describe('subtoken', () => {
      it('should be created & description should be updated', async () => {
        var subAssetName = parentAssetInfo.asset + '.' + utils.createAssetName(10)
        var assetInfo = {
          asset: subAssetName,
          divisible: true,
          pubkey: c0banparty.publicKey,
          quantity: 100,
          source: c0banparty.address
        }
        await c0banparty.createIssuance(assetInfo);

        var asset = await c0banparty.getAssetInfo(assetInfo.asset);
        expect(asset.asset_longname).toBe(assetInfo.asset)
        expect(asset.locked).toBe(false)

        // lock
        expect(asset.locked).toBeFalsy()
        assetInfo.description = 'LOCK'
        assetInfo.quantity = 0
        await c0banparty.createIssuance(assetInfo);
        var asset = await c0banparty.getAssetInfo(assetInfo.asset);
        console.log('asset.locked', asset.locked)
        expect(asset.locked).toBeTruthy()

        // description
        var description = 'updated'
        assetInfo.description = description
        await c0banparty.createIssuance(assetInfo);
        var asset = await c0banparty.getAssetInfo(assetInfo.asset);
        expect(asset.description).toBe(description)
      });
    });
  });

  describe('levy subtoken', () => {
    let parentAssetInfo
    beforeAll(async () => {
      parentAssetInfo = {
        asset: utils.createAssetName(10),
        pubkey: c0banparty.publicKey,
        quantity: 10000000000,
        source: c0banparty.address,
      }

      var checkAddreses = [
        c0banparty.address, // holder
        c0banparty.address, // non holder
      ];
      await c0banparty.sendRyoThresholdExceeded(checkAddreses, supplementRYO)
  
    }, timeout);

    it('should create levy subtoken', async () => {
      // create parent token
      await c0banparty.createIssuance(parentAssetInfo);
      await c0banClient.generate(1)
      await utils.sleep(2000)  // for propagation

      // create levy sub token
      var subAssetName = parentAssetInfo.asset + '.LEVY' + utils.createAssetName(6)
      var levyLabel = 'TESTLABEL'
      var levyAsset = 'RYO'
      var levyNumber = 150000000
      var assetInfo = {
        asset: subAssetName,
        divisible: false,
        pubkey: c0banparty.publicKey,
        quantity: 100,
        source: c0banparty.address,
        levy_type: true,
        levy_asset: levyAsset,
        levy_label: levyLabel,
        levy_number: levyNumber
      }
      await c0banparty.createIssuance(assetInfo);
      await c0banClient.generate(1)
      await utils.sleep(2000)  // for propagation
      // levy check
      var asset = await c0banparty.getAssetInfo(assetInfo.asset);
      expect(asset.asset_longname).toBe(assetInfo.asset)
      expect(asset.levy_type).toBe(1)
      expect(asset.levy_asset).toBe(levyAsset)
      expect(asset.levy_label).toBe(levyLabel)
      expect(asset.levy_number).toBe(levyNumber)
      expect(asset.locked).toBe(true)

      // description update
      var description = 'updated'
      assetInfo.description = description
      assetInfo.quantity = 0
      await c0banparty.createIssuance(assetInfo);
      await c0banClient.generate(1)
      await utils.sleep(2000)  // for propagation  
      var asset = await c0banparty.getAssetInfo(assetInfo.asset);
      expect(asset.description).toBe(description)

      ///// levy check
      // var fromAddress = holderAddress
      // var toAddress = nonHolderAddress
      // var quantity = 1
      // // holder check
      // var origBalance = await this.c0banparty.getUserRyoBalance(c0banparty.address)
      // c0banparty.sendAsset(fromAddress, toAddress, parentAssetInfo, quantity)
      // c0banparty.sendAsset(fromAddress, toAddress, assetInfo, quantity)
      // var afterBalance = await this.c0banparty.getUserRyoBalance(c0banparty.address)
      // expect(origBalance).toBe(afterBalance)
      // TODO

      // non-holder
      // TODO

    });

    it('can not create levy subtoken when divisible and levy is specified', async () => {
      var subAssetName = parentAssetInfo.asset + '.LEVY' + utils.createAssetName(6)
      var levyLabel = 'TESTLABEL'
      var levyAsset = 'RYO'
      var levyNumber = 150000000
      var assetInfo = {
        asset: subAssetName,
        divisible: true,
        pubkey: c0banparty.publicKey,
        quantity: 100,
        source: c0banparty.address,
        levy_type: true,
        levy_asset: levyAsset,
        levy_label: levyLabel,
        levy_number: levyNumber
      }
      try {
        await c0banparty.createIssuance(assetInfo);
      } catch (e) {
        expect(e).toBe('{"message": "Error composing issuance transaction via API: [\'Cannot specify both(divisible, levy) at the same time\']", "code": -32001}')
      }
    });
  });
});
