require('dotenv').config();
const crosschain = require('conflux-crosschain');
const { Conflux } = require('js-conflux-sdk');
const moment = require('moment');
const ethers = require('ethers');
const jsonfile = require('jsonfile');
const file = './data.json';

function toBN(val) {
  return ethers.BigNumber.from(val);
}

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

// https://gist.github.com/aalu1418/15b87cd559c1f9b19ca945a1a1d4d69e
const bridgeUrl = 'http://23.102.224.244:8101';
const defiAddress = '0x0000000000000000000000000000000000000000';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
const ADDRESS_PRIZETOKEN = '0x86cca06c660ad995d4ecd49be9bbdd8113fdefca'; // caLink address on conflux
const ADDRESS_PIUSDCONFLUX = '0x8961A4a15DBE65e742097CCcB87c1863e22e07EC'; // on conflux
const ADDRESS_PIUSDETH = '0x35D70a7fCdB1cf4d2B40AbA7aE517F81d0F74bF4'; // on eth
const ABI_IERC20 = require('./abi/IERC20.json');
const ABI_PIUSDCONFLUX = require('./abi/PIUSDCONFLUX.json');
const ABI_PIUSDETH = require('./abi/PIUSDETH.json');

const INFURA_URL = 'https://kovan.infura.io/v3/7afa2766c5c14e63b00e0935c24b32b5';

// {
//   reference: '0xec23855ff01012e1823807ce19a790cebc4a64da',
//   burn_fee: '0',
//   mint_fee: '0',
//   wallet_fee: '0',
//   minimal_mint_value: '1',
//   symbol: 'caLINK',
//   decimals: 18,
//   sponsor_value: '9989109227800000000',
//   is_admin: false,
//   ctoken: '0x86cca06c660ad995d4ecd49be9bbdd8113fdefca'
// }

// { piUSDConflux: '0x828Ff416CbBF3231709f09208B7B25Ec325B04CB' }

let initialData = jsonfile.readFileSync(file);
if (!initialData.prizeSymbol) {
  initialData = {
    prizeSymbol: 'caLINK',
    address_piUSDEth: ADDRESS_PIUSDETH,
    address_piUSDConflux: ADDRESS_PIUSDCONFLUX,
    history: [],
    chance: {},
    sendToConfluxTxs: []
  };
  jsonfile.writeFileSync(file, initialData);
}

class Singleton {
  stat = initialData;
  loop = true;
  output = '';

  async initEth() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
      const wallet = new ethers.Wallet(PRIVATE_KEY_2, provider);
      const piUSD = new ethers.Contract(ADDRESS_PIUSDETH, ABI_PIUSDETH, wallet);

      this.piUSD = piUSD;
      const symbol = await piUSD.symbol();
      console.log(symbol);
    } catch (err) {
      console.error(err);
    }
  }

  async updateEth() {
    try {
      const piUSD = this.piUSD;
      const atokenBalanceLocked = await piUSD.interestTokenBalance();
      const deposit = await piUSD.getTotalDeposit();
      const interest = await piUSD.getInterest();
      this.stat.atokenBalanceLocked = atokenBalanceLocked.toString();
      this.stat.deposit = deposit.toString();
      this.stat.interestNotSent = interest.toString();
      if (interest.gt('1')) {
        const tx = await piUSD.sendInterestToConflux();
        console.log('sendInterestToConflux..');
        console.log('txHash: ', tx.hash);
        await tx.wait();
        if (!this.stat.sendToConfluxTxs) this.stat.sendToConfluxTxs = [];
        this.stat.sendToConfluxTxs.unshift({
          txHash: tx.hash,
          ts: moment().unix(),
          amount: interest.toString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  }


  async init() {
    await this.initEth();
    const conflux = new Conflux({
      url: 'http://test.confluxrpc.org'
      // logger: console,
    });

    this.conflux = conflux;

    const account = conflux.wallet.addPrivateKey(PRIVATE_KEY);
    const confluxAddress = account.address;
    const ethAddress = await crosschain.getUserReceiveWalletEth(
      confluxAddress,
      defiAddress,
      bridgeUrl
    );

    const piUSDConflux = conflux.Contract({
      abi: ABI_PIUSDCONFLUX,
      address: ADDRESS_PIUSDCONFLUX
    });

    const erc20 = conflux.Contract({
      abi: ABI_IERC20,
      address: ADDRESS_PRIZETOKEN
    });

    this.address = confluxAddress;
    this.ethAddress = ethAddress;
    this.erc20 = erc20;
    this.piUSDConflux = piUSDConflux;
    this.stat.confluxAddress = confluxAddress;
    this.stat.receiverWallet = ethAddress;

    try {
      const MAX_INT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
      let txHash = await this.erc20.approve(ADDRESS_PIUSDCONFLUX, MAX_INT).sendTransaction({ from: this.address });
      console.log(txHash);
    } catch (err) {
      console.error(err);
    }

    console.log(this.stat);
  }

  async update() {

    await this.updateEth();

    try {
      // retrieve amount link in this account
      let balance = await this.erc20.balanceOf(this.address);
      this.stat.interestAccumulated = balance.toString();
      balance = toBN(balance.toString());

      // retrieve number of spenders
      let slotsCount = await this.piUSDConflux.slotsCount();
      slotsCount = slotsCount.toString();
      this.stat.slotsCount = slotsCount.toString();;
      slotsCount = toBN(slotsCount);

      let len = slotsCount.toNumber();
      const chance = {};
      for (let i = 0; i < len; i++) {
        const addr = await this.piUSDConflux.slotsAtIndex(i);
        if (!chance[addr]) chance[addr] = 0;
        chance[addr] += 1;
      }
      this.stat.chance = chance;

      // if there is enough
      if (balance.gt('10') && slotsCount.gt('0')) {
        const amount = balance.div(10).toString();

        // send prize to one random spenders
        console.log('sendPrizeToLuckySpender..');
        try {
          const txHash = await this.piUSDConflux.sendPrizeToLuckySpender(ADDRESS_PRIZETOKEN, amount).sendTransaction({ from: this.address });
          console.log(txHash);
          const lastWinner = await this.piUSDConflux.getLastWinner();
          this.stat.history.unshift({ txHash, ts: moment().unix(), prize: amount, winner: lastWinner });
        } catch (err) {
          console.error(err);
        }
      }

      const lastWinner = await this.piUSDConflux.getLastWinner();
      this.stat.lastWinner = lastWinner;

      // better log output
      const newOutput = JSON.stringify(this.stat);
      if (newOutput !== this.output) {
        this.output = newOutput;
        console.log(this.stat);
      }

      jsonfile.writeFile(file, this.stat);

      return true;
    } catch (err) {
      console.error(err)
    }
    return false;
  }

  async faucetTo(to) {
    const amount = '1000000000000000000';
    const txHash = await this.piUSDConflux.transfer(to, amount).sendTransaction({ from: this.address });
    return txHash;
  }

  async run() {
    await this.init();
    // await this.update();
    while (this.loop) {
      await this.update();
      await delay(60000);
    };
  }

}

const app = new Singleton();
module.exports = app;
// const app = new Singleton();
// app.run();