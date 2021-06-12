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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text
} from "react-native";
import * as UpdateAPK from "rn-update-apk";

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      // If you have something in state, you will be able to provide status to users
      downloadProgress: -1,
      allApps: [],
      allNonSystemApps: [],
    };

    updater = new UpdateAPK.UpdateAPK({

      // iOS must use App Store and this is the app ID. This is a sample: "All Birds of Ecuador" (¡Qué lindo!)
      iosAppId: "1104809018", 

      apkVersionUrl:
        "https://raw.githubusercontent.com/mikehardy/react-native-update-apk/master/example/test-version.json",

      //apkVersionOptions is optional, you should use it if you need to pass options to fetch request
      apkVersionOptions: {
        method:'GET',
        headers: {}
      },
      
      //apkOptions is optional
      //Complements or replaces the DownloadFileOptions (from react-native-fs) to download the new APK
      //By default the following options are already set: fromUrl, toFile, begin, progress, background and progressDivider
      //You should use it if you need to pass additional information (for example: headers) to download the new APK
      apkOptions: {
        headers: {}
      },

      // The name of this 'fileProviderAuthority' is defined in AndroidManifest.xml. THEY MUST MATCH.
      // By default other modules like rn-fetch-blob define one (conveniently named the same as below)
      // but if you don't match the names you will get an odd-looking XML exception:
      // "Attempt to invoke virtual method 'android.content.res.XmlResourceParser ....' on a null object reference"
      fileProviderAuthority: "com.example.provider",

      // This callback is called if there is a new version but it is not a forceUpdate.
      needUpdateApp: performUpdate => {
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
            // ...you will need to guide them through that, maybe by explaining it here, before you call performUpdate(true);
            { text: "Update", onPress: () => performUpdate(true) }
          ]
        );
      },
      
      // This will be called before the download/update where you defined forceUpdate: true in the version JSON
      forceUpdateApp: () => {
        console.log("forceUpdateApp callback called");
      },

      // Called if the current version appears to be the most recent available
      notNeedUpdateApp: () => {
        console.log("notNeedUpdateApp callback called");
      },

      // This is passed to react-native-fs as a callback
      downloadApkStart: () => {
        console.log("downloadApkStart callback called");
      },

      // Called with 0-99 for progress during the download
      downloadApkProgress: progress => {
        console.log(`downloadApkProgress callback called - ${progress}%...`);
        // This is your opportunity to provide feedback to users on download progress
        // If you hae a state variable it is trivial to update the UI
        this.setState({ downloadProgress: progress });
      },
      
      // This is called prior to the update. If you throw it will abort the update
      downloadApkEnd: () => {

        // This could be an opportunity to check the APK signature thumbprints,
        // If they mismatch your update will fail, the user will have to uninstall first.
       
        // If you implement SHAsums on the file you could detect tampering here as well

        // Finally for APK25+ you should check REQUEST_INSTALL_PACKAGES permission
        // prior to the attempt at some point, and provide guidance about "unknown sources" etc
        console.log("downloadApkEnd callback called");
      },

      // This is called if the fetch of the version or the APK fails, so should be generic
      onError: err => {
        console.log("onError callback called", err);
        Alert.alert("There was an error", err.message);
      }
    });
  }

  async componentDidMount() {
      UpdateAPK.getApps().then(apps => {
        console.log("Installed Apps: ", JSON.stringify(apps));
        this.setState({ allApps: apps});
      }).catch(e => console.log("Unable to getApps?", e));

      UpdateAPK.getNonSystemApps().then(apps => {
        console.log("Installed Non-System Apps: ", JSON.stringify(apps));
        this.setState({ allNonSystemApps: apps});
      }).catch(e => console.log("Unable to getNonSystemApps?", e));
    }

  _onCheckServerVersion = () => {
    console.log("checking for update");
    updater.checkUpdate();
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
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
            Installed Apps: {JSON.stringify(this.state.allApps, null, '\t')}
          </Text>
          <Text style={styles.instructions}>
            Installed Non-System Apps: {JSON.stringify(this.state.allNonSystemApps, null, '\t')}
          </Text>
          <Text style={styles.instructions}>
            Installed Package Certificate SHA-256 Digest:
            { UpdateAPK.getInstalledSigningInfo() ? UpdateAPK.getInstalledSigningInfo()[0].thumbprint : "" }
          </Text>
          <Text style={styles.instructions}>
            { UpdateAPK.getInstalledSigningInfo() ? UpdateAPK.getInstalledSigningInfo()[0].toString : "" }
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
      </SafeAreaView>
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
