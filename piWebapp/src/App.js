import React from 'react';
import { View, Dimensions } from 'react-native';
import Router from './Router';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'busy',
      landscape: false,
      w: Dimensions.get('window').width
    };
  }

  async componentDidMount() {
    const ww = Dimensions.get('window').width;
    const wh = Dimensions.get('window').height;
    if (ww > wh) {
      this.setState({ landscape: true, w: wh });
    }
  }

  componentWillMount() {
  }

  render() {


    return (
      <>
        <style type="text/css">{`
          @font-face {
            font-family: 'MaterialIcons';
            src: url(${require('react-native-vector-icons/Fonts/MaterialIcons.ttf')}) format('truetype');
          }

          @font-face {
            font-family: 'FontAwesome';
            src: url(${require('react-native-vector-icons/Fonts/FontAwesome.ttf')}) format('truetype');
          }
        `}</style>

        <View style={{ flex: 1 }}>
          <View style={{ height: '100vh' }}>
            <Router />
          </View>
        </View>
      </>
    );
  }

}

export default App;
