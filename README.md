# INTEREST PRIZE DOLLAR (piUSD)

This is submission for hackathon [Gitcoin - Conflux](https://gitcoin.co/issue/Conflux-Chain/gitcoin-bounties/1/100023997)

[![](http://img.youtube.com/vi/6YarK1sfIvY/0.jpg)](http://www.youtube.com/watch?v=6YarK1sfIvY "Prize Interest Dollar - Gitcoin Conflux Aave Hackathon")

Check the [dapp in testnet here](http://156.67.218.126:8877/)

## The Idea

An aave interest generated prize that given to the most stabletoken spender in conflux network blockchain.

## The Components

- [Shuttleflow](https://conflux-dev.github.io/conflux-dex-docs/shuttleflow/) to enable smartcontract in ethereum to send token to address in conflux network
- [Aave's Atokens](https://aave.com/aTokens/) to convert many stable token to interest earning stable token
- piUSD ethereum. Smart contract to mint piUSD. Inside it, stabletoken will be converted to atoken and become collateral for piUSD minted. piUSD can be minted directly to conflux via shuttleflow
- piUSD conflux. ERC20 token deployed in conflux with additional feature: Its spending recorded
- piManager. A web service to trigger interest in piUSD ethereum to be sent to conflux via shuttleflow to prize pool address. Its also trigger prize pool to send the prize to piUSD conflux. piUSD conflux will select the recever randomly from its spending records
- piWebapp. A reactjs app to show stats and interact with smartcontract both in ethereum and conflux
- tokenSwapper smart contract. piUSD sent to conflux just a generic ERC777. Use this smartcontract to swap it to token which the spending can be recorded and receive prize

## How To Build

### piUSD ethereum

1.  Enter folder piRemix
2.  Copy [piUSDEth.sol](https://github.com/leledumbo549/interest-prize-dollar/blob/main/piRemix/piUSDEth.sol) to [remix](https://remix.ethereum.org) and deploy it on kovan network
3.  To have different conflux address as prize pool, change conflux address inside it

### piUSD conflux & Token Swapper

1.  Setup cfxtruffle for global usage
2.  Enter folder piSmartContract
3.  Yarn install or npm install
4.  Create .env file add PRIVATE_KEY=yourprivatekey
5.  [Modify openzeppelin ERC777 inside node modules](https://github.com/leledumbo549/interest-prize-dollar/blob/main/piSmartContract/hack_for_conflux_erc777.txt)
6.  cfxtruffle compile
7.  cfxtruffle migrate

### piManager

1.  Enter folder piManager
2.  Create .env file add PRIVATE_KEY=yourprivatekey
3.  Add PRIVATE_KEY_2=yourprivatekey
4.  Yarn install or npm install
5.  node server.js

### piWebapp

1.  Enter folder piWebapp
2.  Yarn install or npm install
3.  Yarn run start to debug
4.  Yarn run build to build release version
