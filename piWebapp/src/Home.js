import React from 'react';
import { View, Dimensions, ScrollView, ActivityIndicator, TextInput, Picker } from 'react-native';
import { Button, Text, Header } from 'react-native-elements';
import {
  MemoryRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { observer } from "mobx-react";
import manager from './Manager';
import lib from './Lib';

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'busy',
      mintTo: 'conflux',
      amount: '',
      mode: 'mint'
    };
  }

  async componentDidMount() {
  }

  componentWillMount() {
  }

  async mint() {
    try {
      const toConflux = (this.state.mintTo === 'conflux');
      const amount = this.state.amount;
      if (toConflux) {
        await manager.mintPiUSDToConflux(amount);
      } else {
        await manager.mintPiUSDToEth(amount);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async redeem() {
    try {
      const amount = this.state.amount;
      await manager.redeemPiUSD(amount);
    } catch (err) {
      console.error(err);
    }
  }

  async approveTokenSwap() {
    try {
      await manager.approveTokenSwap();
    } catch (err) {
      console.error(err);
    }
  }

  async tokenSwap() {
    try {
      await manager.tokenSwap();
    } catch (err) {
      console.error(err);
    }
  }

  renderEth() {
    let disabled = false;
    const data = manager.data;

    let form;
    if (this.state.mode === 'mint') {
      form = (
        <View>
          <pre>enter amount LINK to be minted as piUSD</pre>
          <TextInput
            style={{ borderWidth: 1, borderColor: 'gainsboro', padding: 10 }}
            onChangeText={(txt) => this.setState({ amount: txt })}
            value={this.state.amount}
            placeholder='ENTER AMOUNT'
          />
          <pre style={{ textAlign: 'center' }}>where piUSD to be minted</pre>
          <Picker
            style={{ borderWidth: 1, borderColor: 'gainsboro', padding: 10 }}
            disabled={disabled}
            selectedValue={this.state.mintTo}
            onValueChange={(itemValue) => this.setState({ mintTo: itemValue })}
          >
            <Picker.Item label={'Conflux Network'} value={'conflux'} />
            <Picker.Item label={'Ethereum'} value={'ethereum'} />
          </Picker>

          <Text> </Text>
          <Button title='MINT' type="outline" raised={true} onPress={() => this.mint()} />
        </View>
      );
    } else {
      form = (
        <View>
          <pre>enter amount piUSD to be redeemed back to LINK</pre>
          <TextInput
            style={{ borderWidth: 1, borderColor: 'gainsboro', padding: 10 }}
            onChangeText={(txt) => this.setState({ amount: txt })}
            value={this.state.amount}
            placeholder='ENTER AMOUNT'
          />
          <Text> </Text>
          <Button title='REDEEM' type="outline" raised={true} onPress={() => this.redeem()} />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'center' }}>
        <pre style={{ textAlign: 'center' }}>
          ETHEREUM<br />
          wallet address: {data.ethAddress}<br />
          LINK balance: {data.balance_LINK}<br />
          piUSD balance: {data.balance_piUSD}<br />
          LINK allowance: {data.allowance_LINK ? 'true' : 'false'}<br />
          shuttleflow address: {data.shuttleflowAddress}<br />
          piUSD in shuttleflow: {data.balance_piUSD_shuttleflow}<br />
        </pre>
        <Text> </Text>
        <View>
          <pre style={{ textAlign: 'center' }}>what do you want to do</pre>
          <Picker
            style={{ borderWidth: 1, borderColor: 'gainsboro', padding: 10 }}
            disabled={disabled}
            selectedValue={this.state.mode}
            onValueChange={(itemValue) => this.setState({ mode: itemValue })}
          >
            <Picker.Item label={'Mint piUSD'} value={'mint'} />
            <Picker.Item label={'Redeem piUSD'} value={'redeem'} />
          </Picker>
        </View>
        <Text> </Text>
        {form}
      </View>
    );
  }

  renderCfx() {
    const data = manager.data;
    const haveAllowance = data.allowance_cpiUSD_tokenswapper;
    let btns;

    if (!haveAllowance) {
      btns = (
        <View>
          <Button title='Approve Token Swapper' type="outline" raised={true} onPress={() => this.approveTokenSwap()} />
        </View>
      );
    } else {
      btns = (
        <View>
          <Button title='SWAP cpiUSD to cpiUSDv2' type="outline" raised={true} onPress={() => this.tokenSwap()} />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'center' }}>
        <pre style={{ textAlign: 'center' }}>
          CONFLUX<br />
          wallet address: {data.cfxAddress}<br />
          caLINK balance: {data.balance_caLINK}<br />
          cpiUSD balance: {data.balance_cpiUSD}<br />
          cpiUSDv2 balance: {data.balance_cpiUSDv2}<br />
        </pre>
        <Text> </Text>
        <pre style={{ textAlign: 'center' }}>
          currently cpiUSD just a generic ERC777 token<br />
          it must be swapped to cpiUSDv2 to have its spending recorded
        </pre>
        <Text> </Text>
        {btns}
        <pre style={{ textAlign: 'center' }}>
          spend cpiUSDv2 to win interest accumulated prize<br />
          the more you spend the more chance to win
        </pre>
      </View>
    );
  }

  render() {
    return (
      <View style={{ padding: 10 }}>
        {this.renderEth()}
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        {this.renderCfx()}
        <Text> </Text>
        <Text> </Text>
      </View>
    );
  }

}

export default observer(Page);
