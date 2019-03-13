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

## Manual steps for Android

Android API24+ requires the use of a FileProvider to share "content" (like
downloaded APKs) with other applications (like the system installer, to install
the APK update). So you must add a FileProvider entry to your AndroidManifest,
and it will reference a "filepaths" XML file. Both are demonstrated in the example.

Please install and run the example to see how it works then adapt it into your own app.

## Usage - see included example, or like this:
```javascript
import { Alert } from 'react-native';
import updateApk from 'rn-update-apk';

const updater = new updateApk({
  iosAppId: '123456', // iOS is app store only, but we can point the user there
  apkVersionUrl: 'https://github.com/your-github-name/version.json',
  fielProviderAuthority: "com.example.fileprovider",
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
updater.checkUpdate();
```

```javascript
// version.json example
// Note you will need to verify SSL works for Android <5 as it has SSL Protocol bugs
// If it doesn't then you may be able to use Google Play Services to patch the SSL Provider, or just serve your updates over HTTP for Android <5
// https://stackoverflow.com/a/36892715
{
  "versionName":"1.0.0",
  "apkUrl":"https://github.com/NewApp.apk",
  "forceUpdate": false
}
```
## Library Dependency
* react-native-fs
