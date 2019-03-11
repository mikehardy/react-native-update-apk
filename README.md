# React Native Update APK
Easily check for new APKs and install them in React Native.

## Installation
```bash
npm install rn-update-apk --save
```

Linking automatically with react-native link

```bash
react-native link rn-update-apk
react-native link react-native-fs
```
## Usage
```javascript
import { Alert } from 'react-native';
import updateApk from 'rn-update-apk';

const updateApk = new updateApk({
  iosAppId: '123456', // iOS must install from app store, but we can point the user there
  apkVersionUrl: 'https://github.com/your-github-name/version.json',
  needUpdateApp: (needUpdate) => {
    Alert.alert(
      'Update Available',
      'New version released, do you want to update?',
      [
        {text: 'Cancel', onPress: () => {}},
        {text: 'Update', onPress: () => needUpdate(true)}
      ]
    );
  },
  forceUpdateApp: () => {
    console.log("Force update will start")
  },
  notNeedUpdateApp: () => {
    console.log("App is up to date")
  },
  downloadApkStart: () => { console.log("Start") },
  downloadApkProgress: (progress) => { console.log(`Downloading ${progress}%...`) },
  downloadApkEnd: () => { console.log("End") },
  onError: () => { console.log("downloadApkError") }
});
updateApk.checkUpdate();
```

```javascript
// version.json
{
  "versionName":"1.0.0",
  "apkUrl":"https://github.com/NewApp.apk",
  "forceUpdate": false
}
```
## Library Dependency
* react-native-fs
