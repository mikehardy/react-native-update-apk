/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import updateApk from 'rn-update-apk';

const updater = new updateApk({
  iosAppId: '1104809018', // iOS must use App Store. This is a sample: "All Birds of Ecuador" (¡Qué lindo!)
  apkVersionUrl: 'https://raw.githubusercontent.com/mikehardy/react-native-update-apk/master/example/test-version.json',
  needUpdateApp: (needUpdate) => {
    Alert.alert(
      'Update Available',
      'New version released, do you want to update?',
      [
        {text: 'Cancel', onPress: () => {}},
        // Note, apps can be large. You may want to check if the network is metered (cellular data) to be nice.
        // Note that the user will likely get a popup saying the device is set to block installs from uknown sources.
        // ...you will need to guide them through that, maybe by explaining it here, before you call needUpdate(true);
        {text: 'Update', onPress: () => needUpdate(true)}
      ]
    );
  },
  forceUpdateApp: () => {
    console.log("forceUpdateApp callback called")
  },
  notNeedUpdateApp: () => {
    console.log("notNeedUpdateApp callback called")
  },
  downloadApkStart: () => { console.log("downloadApkStart callback called") },
  downloadApkProgress: (progress) => { console.log(`downloadApkProgress callback called - ${progress}%...`) },
  downloadApkEnd: () => { console.log("downloadApkEnd callback called") },
  onError: (err) => { console.log("onError callback called", err) }
});

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      currentVersion: 'unknown',
      serverVersion: 'unknown',
    }
  }

  async componentDidMount() {

  }

  _onCheckServerVersion = () => {
    console.log('Check server version');
  }

  _onCheckServerVersion = () => {
    updater.checkUpdate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>rn-update-apk example</Text>
        <Text style={styles.instructions}>Current APK version: {this.state.currentVersion}</Text>
        <Button title="Check Server Version" onPress={this._onCheckServerVersion}>
          <Text style={styles.instructions}>Check Server Version</Text>
        </Button>
        <Button title="Update App" onPress={this._onUpdateApp}>
          <Text style={styles.instructions}>Update App</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
