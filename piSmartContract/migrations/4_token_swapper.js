const SC = artifacts.require("TokenSwapper.sol");

module.exports = async function (deployer, network, accounts) {
  const v1 = '0x8a1cacfc644a88d371517262d030b06bb43a3a2d';
  const v2 = '0x8961A4a15DBE65e742097CCcB87c1863e22e07EC';
  await deployer.deploy(SC, v1, v2); // params
  const sc = await SC.deployed();
  const scAddress = sc.address;
  console.log({
    TokenSwapper: scAddress
  });
};