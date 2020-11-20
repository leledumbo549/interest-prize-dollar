// const { Conflux } = require('js-conflux-sdk');
const crosschain = require('conflux-crosschain');
const ethers = require('ethers');


const ADDRESS_CPIUSD = '0x8a1cacfc644a88d371517262d030b06bb43a3a2d'; // on conflux
const ADDRESS_CPIUSDV2 = '0x8961A4a15DBE65e742097CCcB87c1863e22e07EC'; // on conflux
const ADDRESS_CALINK = '0x86cca06c660ad995d4ecd49be9bbdd8113fdefca'; // on conflux
const ADDRESS_TOKENSWAPPER = '0x817F3129c3D8E773025f58e013b7546fe89790C6'; // on conflux
const ABI_IERC20 = require('./abi/IERC20.json');
const ABI_TOKENSWAPPER = require('./abi/TOKENSWAPPER.json');

// https://gist.github.com/aalu1418/15b87cd559c1f9b19ca945a1a1d4d69e
const bridgeUrl = 'http://23.102.224.244:8101';
const defiAddress = '0x0000000000000000000000000000000000000000';

// const conflux = new Conflux({
//   url: 'http://test.confluxrpc.org',
//   logger: console, // for debug
// });

// {
//   reference: '0x35d70a7fcdb1cf4d2b40aba7ae517f81d0f74bf4',
//   burn_fee: '0',
//   mint_fee: '0',
//   wallet_fee: '0',
//   minimal_mint_value: '1',
//   symbol: 'cPIUSD',
//   decimals: 18,
//   sponsor_value: '10000000000000000000',
//   is_admin: false,
//   ctoken: '0x8a1cacfc644a88d371517262d030b06bb43a3a2d'
// }

function toBN(val) {
  return ethers.BigNumber.from(val);
}

class Singleton {
  addressCPIUSD = ADDRESS_CPIUSD;
  addressCPIUSDV2 = ADDRESS_CPIUSDV2;
  addressCALINK = ADDRESS_CALINK;

  async start() {
    // console.log(confluxJS);
    if (!window.conflux) throw Error('no wallet');

    const accounts = await conflux.enable();
    const address = accounts[0];
    this.address = address;

    const shuttleflowAddress = await crosschain.getUserReceiveWalletEth(
      address,
      defiAddress,
      bridgeUrl
    );

    this.shuttleflowAddress = shuttleflowAddress;

    // const account = conflux.wallet.addPrivateKey(PRIVATE_KEY);
    const cpiUSD = confluxJS.Contract({
      abi: ABI_IERC20,
      address: ADDRESS_CPIUSD
    });

    const cpiUSDv2 = confluxJS.Contract({
      abi: ABI_IERC20,
      address: ADDRESS_CPIUSDV2
    });

    const caLINK = confluxJS.Contract({
      abi: ABI_IERC20,
      address: ADDRESS_CALINK
    });

    const tokenSwapper = confluxJS.Contract({
      abi: ABI_TOKENSWAPPER,
      address: ADDRESS_TOKENSWAPPER
    });

    this.cpiUSD = cpiUSD;
    this.cpiUSDv2 = cpiUSDv2;
    this.caLINK = caLINK;
    this.tokenSwapper = tokenSwapper;
  }

  getAddress() {
    return this.address;
  }

  async stat() {
    if (!this.address) return {};
    console.log('retrieve conflux wallet stat');
    const cpiUSD = this.cpiUSD;
    const cpiUSDv2 = this.cpiUSDv2;
    const caLINK = this.caLINK;
    const address = this.address;
    console.log('get cpiUSD balance..');
    const balance_cpiUSD = await cpiUSD.balanceOf(address);
    console.log('get cpiUSDv2 balance..');
    const balance_cpiUSDv2 = await cpiUSDv2.balanceOf(address);
    console.log('get caLINK balance..');
    const balance_caLINK = await caLINK.balanceOf(address);

    let a = await cpiUSD.allowance(address, ADDRESS_TOKENSWAPPER);
    a = toBN(a.toString());
    const allowance = a.gte('100000000000000000000000000000000000000000000000000000000000000000000000000000');

    return {
      balance_cpiUSD: balance_cpiUSD.toString(),
      balance_cpiUSDv2: balance_cpiUSDv2.toString(),
      balance_caLINK: balance_caLINK.toString(),
      allowance_cpiUSD_tokenswapper: allowance
    }
  }

  async approve() {
    const MAX_INT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const txHash = await this.cpiUSD.approve(ADDRESS_TOKENSWAPPER, MAX_INT).sendTransaction({ from: this.address });
    return txHash;
  }

  async swapToV2() {
    console.log('get cpiUSD balance..');
    const balance = await this.cpiUSD.balanceOf(this.address);
    const amount = balance.toString();
    console.log('swapping ' + amount);
    const txHash = await this.tokenSwapper.swapToV2(amount).sendTransaction({ from: this.address });
    return txHash;
  }

}

export default new Singleton();

