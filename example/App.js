/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as UpdateAPK from "rn-update-apk";

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      downloadProgress: -1
    };

    updater = new UpdateAPK.UpdateAPK({
      iosAppId: "1104809018", // iOS must use App Store. This is a sample: "All Birds of Ecuador" (¡Qué lindo!)
      apkVersionUrl:
        "https://raw.githubusercontent.com/mikehardy/react-native-update-apk/master/example/test-version.json",
      fileProviderAuthority: "com.example.fileprovider",
      needUpdateApp: needUpdate => {
        Alert.alert(
          "Update Available",
          "New version released, do you want to update? " +
            "(TESTING NOTE 1: stop your dev package server now - or the test package will try to load from it " +
            "instead of the included bundle leading to Javascript/Native incompatibilities." +
            "TESTING NOTE 2: the version is fixed at 1.0 so example test updates always work. " +
            "Compare the Last Update Times to verify it installed)",
          [
            { text: "Cancel", onPress: () => {} },
            // Note, apps can be large. You may want to check if the network is metered (cellular data) to be nice.
            // Note that the user will likely get a popup saying the device is set to block installs from uknown sources.
            // ...you will need to guide them through that, maybe by explaining it here, before you call needUpdate(true);
            { text: "Update", onPress: () => needUpdate(true) }
          ]
        );
      },
      forceUpdateApp: () => {
        console.log("forceUpdateApp callback called");
      },
      notNeedUpdateApp: () => {
        console.log("notNeedUpdateApp callback called");
      },
      downloadApkStart: () => {
        console.log("downloadApkStart callback called");
      },
      downloadApkProgress: progress => {
        console.log(`downloadApkProgress callback called - ${progress}%...`);
        this.setState({ downloadProgress: progress });
      },
      downloadApkEnd: () => {
        console.log("downloadApkEnd callback called");
      },
      onError: err => {
        console.log("onError callback called", err);
        Alert.alert("There was a problem updating: " + err.message);
      }
    });
  }

  async componentDidMount() {
    // If you want to update devices below Android 5, they have SSL issues with some servers.
    // You will get a protocol error unless you patch the SSL Provider.
    // This will fail if they don have Google Play Services installed though.
    UpdateAPK.patchSSLProvider()
      .then(ret => {
        console.log("SSL Provider Patch was successful");
      })
      .catch(rej => {
        console.log("SSL Provider patch failed", rej);
        let message = "Old Android API, and SSL Provider could not be patched.";
        if (rej.message.includes("repairable")) {
          message +=
            " This is repairable on this device though." +
            " You should send the users to the Play Store to update Play Services...";
        }
        Alert.alert("Possible SSL Problem", message);
      });
  }

  _onCheckServerVersion = () => {
    console.log("checking for update");
    updater.checkUpdate();
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>rn-update-apk example</Text>
        <Text style={styles.instructions}>
          Installed Package Name: {UpdateAPK.getInstalledPackageName()}
        </Text>
        <Text style={styles.instructions}>
          Installed Version Code: {UpdateAPK.getInstalledVersionCode()}
        </Text>
        <Text style={styles.instructions}>
          Installed Version Name: {UpdateAPK.getInstalledVersionName()}
        </Text>
        <Text style={styles.instructions}>
          Installed First Install Time:
          {new Date(+UpdateAPK.getInstalledFirstInstallTime()).toUTCString()}
        </Text>
        <Text style={styles.instructions}>
          Installed Last Update Time:
          {new Date(+UpdateAPK.getInstalledLastUpdateTime()).toUTCString()}
        </Text>
        <Text style={styles.instructions}>
          Installed Package Installer:
          {UpdateAPK.getInstalledPackageInstaller()}
        </Text>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.instructions}>
            Installed Package Certificate SHA-256 Digest:
            {UpdateAPK.getInstalledSigningInfo()[0].thumbprint}
          </Text>
          <Text style={styles.instructions}>
            {UpdateAPK.getInstalledSigningInfo()[0].toString}
          </Text>
        </ScrollView>
        {this.state.downloadProgress != -1 && (
          <Text style={styles.instructions}>
            Download Progress: {this.state.downloadProgress}%
          </Text>
        )}
        <Button
          title="Check Server For Update"
          onPress={this._onCheckServerVersion}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    fontSize: 12,
    textAlign: "left",
    color: "#333333",
    marginBottom: 5
  }
});
