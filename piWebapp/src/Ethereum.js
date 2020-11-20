const ethers = require('ethers');

const ADDRESS_PIUSD = '0x35d70a7fcdb1cf4d2b40aba7ae517f81d0f74bf4'; // on eth
const ADDRESS_LINK = '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789'; // on eth
const ABI_IERC20 = require('./abi/IERC20.json');
const ABI_PIUSDETH = require('./abi/PIUSDETH.json');

// https://gist.github.com/aalu1418/15b87cd559c1f9b19ca945a1a1d4d69e
// const bridgeUrl = 'http://23.102.224.244:8101';
// const defiAddress = '0x0000000000000000000000000000000000000000';

class Singleton {
  addressPIUSD = ADDRESS_PIUSD;
  addressLINK = ADDRESS_LINK;

  async start() {
    if (!window.ethereum) throw Error('no wallet');
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const piUSD = new ethers.Contract(ADDRESS_PIUSD, ABI_PIUSDETH, signer);
    const LINK = new ethers.Contract(ADDRESS_LINK, ABI_IERC20, signer);

    this.address = address;
    this.piUSD = piUSD;
    this.LINK = LINK;

  }

  getAddress() {
    return this.address;
  }

  async stat() {
    if (!this.address) return {};
    const piUSD = this.piUSD;
    const LINK = this.LINK;
    const address = this.address;
    const balance_piUSD = await piUSD.balanceOf(address);
    const balance_LINK = await LINK.balanceOf(address);
    const allowance_LINK = await LINK.allowance(address, ADDRESS_PIUSD);
    const allowance = allowance_LINK.gte('100000000000000000000000000000000000000000000000000000000000000000000000000000');

    return {
      balance_piUSD: balance_piUSD.toString(),
      balance_LINK: balance_LINK.toString(),
      allowance_LINK: allowance
    }
  }

  async getPiUSDBalance(address) {
    const balance = await this.piUSD.balanceOf(address);
    return balance.toString();
  }

  async approve() {
    const MAX_INT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const tx = await this.LINK.approve(ADDRESS_PIUSD, MAX_INT);
    await tx.wait();
    return tx.hash;
  }

  async wrap(amount, receiver) {
    console.log({ amount, receiver });
    const tx = await this.piUSD.wrap(amount, receiver);
    await tx.wait();
    return tx.hash;
  }

  async unwrap(amount) {
    const tx = await this.piUSD.unwrap(amount);
    await tx.wait();
    return tx.hash;
  }

}

export default new Singleton();

