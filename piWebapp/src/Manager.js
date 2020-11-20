import { decorate, observable, action } from "mobx";
import ethers from 'ethers';
import Config from './Config';
import moment from 'moment';
import axios from 'axios';
import Lib from './Lib';
import Wallet from './Conflux';
import ethWallet from './Ethereum';

function toEther(val) {
  if (!val) return '0.0';
  return ethers.utils.formatEther(val);
}

function fromEther(val) {
  return (ethers.utils.parseEther(val)).toString();
}

function toBN(val) {
  return ethers.BigNumber.from(val);
}

class Manager {

  busy = false;
  data = {};
  managerData = {};

  tickerBusy = false;

  constructor() {
    this.getManagerData();

    setInterval(() => this.ticker(), 1000);
  }

  async ticker() {
    if (this.tickerBusy) return;
    this.tickerBusy = true;
    try {
      await this.getManagerData();
      await Lib.delay(3000);
    } catch (err) {
      console.error(err);
    }

    this.tickerBusy = false;
  }

  async login() {
    try {
      await Wallet.start();
      await ethWallet.start();

      await this.getData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getData() {
    const cfxAddress = Wallet.getAddress();
    const stat = await Wallet.stat();

    const ethAddress = ethWallet.getAddress();
    const stat2 = await ethWallet.stat();

    let balance_piUSD_shuttleflow;
    const shuttleflowAddress = Wallet.shuttleflowAddress;
    if (shuttleflowAddress) {
      balance_piUSD_shuttleflow = await ethWallet.getPiUSDBalance(shuttleflowAddress);
      balance_piUSD_shuttleflow = toEther(balance_piUSD_shuttleflow);
    }

    const data = {
      addressCPIUSD: Wallet.addressCPIUSD,
      addressCPIUSDV2: Wallet.addressCPIUSDV2,
      addressCALINK: Wallet.addressCALINK,
      cfxAddress,
      balance_cpiUSD: toEther(stat.balance_cpiUSD),
      balance_cpiUSDv2: toEther(stat.balance_cpiUSDv2),
      balance_caLINK: toEther(stat.balance_caLINK),
      addressPIUSD: ethWallet.addressPIUSD,
      addressLINK: ethWallet.addressLINK,
      ethAddress,
      balance_piUSD: toEther(stat2.balance_piUSD),
      balance_LINK: toEther(stat2.balance_LINK),
      allowance_LINK: stat2.allowance_LINK,
      balance_piUSD_shuttleflow,
      shuttleflowAddress,
      allowance_cpiUSD_tokenswapper: stat.allowance_cpiUSD_tokenswapper
    }
    console.log(data);
    this.data = data;
  }

  async getManagerData() {
    try {
      const result = await axios.get('http://localhost:8877/stat');
      const json = result.data;
      if (!json.prizeSymbol) throw 'wrong format';

      const interestAccumulated = json.interestAccumulated;
      const spendingRecorded = json.slotsCount;
      const lastWinner = json.lastWinner;

      const atokenLocked = json.atokenBalanceLocked;
      const collateral = json.deposit;
      const atokenInterest = json.interestNotSent;
      const atokenInShuttleflow = json.aLINKinShuttleflow;
      const managerShuttleflowAddress = json.managerShuttleflowAddress;

      const chance = json.chance;
      const spendingRecs = [];
      for (let key in chance) {
        if (chance.hasOwnProperty(key)) {
          const val = chance[key];
          spendingRecs.push({ address: key, txTimes: val });
        }
      }

      const history = json.history;
      const winners = [];
      for (let i = 0; i < history.length; i++) {
        const h = history[i];
        if (i == 5) break;
        winners.push({ txHash: h.txHash, winner: h.winner, prize: h.prize })
      }

      const sendToConfluxTxs = json.sendToConfluxTxs;
      const interestTxs = [];
      for (let i = 0; i < sendToConfluxTxs.length; i++) {
        const tx = sendToConfluxTxs[i];
        if (i == 5) break;
        interestTxs.push({ txHash: tx.txHash, amount: tx.amount })
      }

      this.managerData = {
        interestAccumulated,
        spendingRecorded,
        lastWinner,
        atokenLocked,
        collateral,
        atokenInterest,
        atokenInShuttleflow,
        spendingRecs,
        winners,
        interestTxs,
        managerShuttleflowAddress
      };

      console.log(this.managerData);
    } catch (err) {
      console.error(err);
    }
  }

  async approve() {
    const txHash = await ethWallet.approve();
    return txHash;
  }

  async mintPiUSDToConflux(amount) {
    const receiver = Wallet.shuttleflowAddress;
    const txHash = await ethWallet.wrap(fromEther(amount), receiver);
    await this.getData();
    return txHash;
  }

  async mintPiUSDToEth(amount) {
    const receiver = ethWallet.getAddress()
    const txHash = await ethWallet.wrap(fromEther(amount), receiver);
    await this.getData();
    return txHash;
  }

  async redeemPiUSD(amount) {
    const txHash = await ethWallet.unwrap(fromEther(amount));
    await this.getData();
    return txHash;
  }

  async approveTokenSwap() {
    const txHash = await Wallet.approve();
    await this.getData();
    return txHash;
  }

  async tokenSwap() {
    const txHash = await Wallet.swapToV2();
    await this.getData();
    return txHash;
  }

}

decorate(Manager, {
  busy: observable,
  data: observable,
  managerData: observable,
});

const instance = new Manager();
export default instance;
