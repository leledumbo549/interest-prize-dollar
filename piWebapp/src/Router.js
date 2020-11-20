import React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Button, Text, Header } from 'react-native-elements';
import {
  MemoryRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { observer } from "mobx-react";
import Lib from './Lib';
import manager from './Manager';
import Login from './Login';
import Home from './Home';

class RouterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      layoutHeight: 0
    };
  }

  async componentDidMount() {
    await manager.getData();
  }

  componentWillMount() {
  }

  renderRequirements() {
    const data = manager.data;
    return (
      <pre style={{ overflowWrap: 'anywhere' }}>
        REQUIREMENTS:<br />
      1. install <a target="_blank" href='https://metamask.io/'>metamask</a> and <a target="_blank" href='https://portal.conflux-chain.org/'>confluxportal</a><br />
      2. setup them to kovan & conflux testnet<br />
      3. have eth & cfx testnet from faucet<br />
      - hint: click deposit on metamask & confluxportal<br />
      4. have some LINK from <a target="_blank" href='https://testnet.aave.com/faucet'>aave's faucet</a><br />
      - we will be used LINK as subtitute to USD stable token<br />
      5. setup metamask to show LINK<br />
      - LINK address is: {data.addressLINK}<br />
      - PIUSD address is: {data.addressPIUSD}<br />
      6. setup confluxportal to show caLINK & PIUSD<br />
      - caLINK address is: {data.addressCALINK}<br />
      - PIUSD address is: {data.addressCPIUSDV2}<br />
      - fyi PIUSD is cpiUSDv2<br />
      7. on failed tx, tried to increase gas & gas price<br />
      8. refresh this page if needed<br />
      </pre>
    );
  }

  renderPoolStat() {
    const data = JSON.parse(JSON.stringify(manager.managerData));
    console.log(data);
    const {
      interestAccumulated,
      spendingRecorded,
      lastWinner,
      atokenLocked,
      collateral,
      atokenInterest,
      atokenInShuttleflow,
      managerShuttleflowAddress
    } = data;

    const rows0 = data.spendingRecs ? data.spendingRecs : [];
    const rows1 = data.winners ? data.winners : [];
    const rows2 = data.interestTxs ? data.interestTxs : [];

    let sr = null;
    if (rows0.length > 0) {
      sr = (
        <>
          SPENDING RECORDS:
          {rows0.map((item, index) => {
            const txt = JSON.stringify(item);
            return (
              <pre>
                address: {item.address}<br />
                spend times: {item.txTimes}
              </pre>
            )
          })}
          <br />
          <br />
        </>
      );
    }

    return (
      <pre>
        PRIZE STATS:<br />
        prize: {interestAccumulated} cALINK<br />
        spending records: {spendingRecorded}<br />
        last winner: {lastWinner}<br />
        <br />
        <br />
        PIUSD ETH STATS:<br />
        total minted: {collateral} PIUSD<br />
        collateral: {atokenLocked} ALINK<br />
        interest ready sent to shuttleflow: {atokenInterest} ALINK<br />
        stuck in shuttleflow: {atokenInShuttleflow} ALINK<br />
        manager shuttleflow address: {managerShuttleflowAddress}
        <br />
        <br />
        {sr}
        LAST 5 WINNERS:<br />
        most spender in conflux
        {rows1.map((item, index) => {
          const txt = JSON.stringify(item);
          return (
            <pre>
              txHash: {item.txHash}<br />
              winner: {item.winner}<br />
              prize: {item.prize}
            </pre>
          )
        })}
        <br />
        LAST 5 INTEREST TXS:<br />
        send to conflux via shuttleflow<br />
        {rows2.map((item, index) => {
          const txt = JSON.stringify(item);
          return (
            <pre>
              txHash: {item.txHash}<br />
              amount: {item.amount} ALINK
            </pre>
          )
        })}

      </pre>
    );
  }

  render() {
    let content;
    if (this.state.loggedIn) content = <Home />;
    else content = <Login onLoggedIn={() => this.setState({ loggedIn: true })} />;
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View>
          <pre style={{ textAlign: 'center' }}>** PRIZE INTEREST DOLLAR **<br />
          hmm maybe i cant sent myself 1 piUSD thousand times to have chance win the prize</pre>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <ScrollView>
              <View style={{ paddingHorizontal: 20 }}>
                {content}
              </View>
            </ScrollView>
          </View>
          <View style={{ flex: 1, backgroundColor: 'gainsboro' }}>
            <ScrollView>
              <View style={{ paddingHorizontal: 20 }}>
                {this.renderRequirements()}
                {this.renderPoolStat()}
              </View>
            </ScrollView>
          </View>

        </View>
      </View>
    );
  }

}

export default observer(RouterPage);
