import React from 'react';
import { View, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Text, Header } from 'react-native-elements';
import {
  MemoryRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import manager from './Manager';
import lib from './Lib';
import { observer } from "mobx-react";

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'busy'
    };
  }

  async componentDidMount() {
    try {
      await this.login();
    } catch (err) {
      this.setState({ show: 'login' });
    }
  }

  componentWillMount() {
  }

  async login() {
    try {
      // check allowance
      this.setState({ show: 'busy' });
      await manager.login();
      if (!manager.data.allowance_LINK) {
        return this.setState({ show: 'askApproval' });
      }
      this.props.onLoggedIn();
    } catch (err) {
      console.error(err);
      this.setState({ show: 'login' });
    }
  }

  async approve() {
    try {
      // check allowance
      const tx = await manager.approve();
      this.props.onLoggedIn();
    } catch (err) {
      console.error(err);
      this.setState({ show: 'askApproval' });
    }
  }

  renderLogin() {
    let btn = <ActivityIndicator />;
    if (this.state.show === 'login') btn = (
      <Button title='CONNECT' type="outline" raised={true} onPress={() => this.login()} />
    );
    return (
      <View style={{ alignItems: 'center' }}>
        <pre style={{ textAlign: 'center' }}>
          open this page in chrome<br />
          and ensure metamask and confluxportal installed
        </pre>
        <Text> </Text>
        {btn}
      </View>
    );
  }

  renderAskApproval() {

    return (
      <View style={{ alignItems: 'center' }}>
        <pre style={{ textAlign: 'center' }}>
          please approve piUSD to spend LINK<br />
          we use LINK as subtitute stable token like DAI or USDC
        </pre>
        <Text> </Text>
        <Button title='OKAY' type="outline" raised={true} onPress={() => this.approve()} />
      </View>
    );
  }

  render() {
    let content = this.renderLogin();
    if (this.state.show === 'askApproval') content = this.renderAskApproval();

    return (
      <View style={{ padding: 10 }}>
        {content}
      </View>
    );
  }

}

export default observer(Page);
