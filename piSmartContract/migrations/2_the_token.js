const SC = artifacts.require("piUSDConflux.sol");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(SC); // params
  const sc = await SC.deployed();
  const scAddress = sc.address;
  console.log({
    piUSDConflux: scAddress
  });
};