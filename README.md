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

1. **FileProviders:** Android API24+ requires the use of a FileProvider to share "content" (like
   downloaded APKs) with other applications (like the system installer, to install
   the APK update). So you must add a FileProvider entry to your [AndroidManifest.xml](example/android/app/src/main/AndroidManifest.xml),
   and it will reference a "[filepaths](example/android/app/src/main/res/xml/filepaths.xml)" XML file. Both are demonstrated in the example as linked here.

1. **Play Services** If you use Google Play Services, make sure to define 'googlePlayServicesVersion' as the correct version in [your main build.gradle](example/android/build.gradle) so you don't have crashes related to version mismatches. If you don't have 'com.google.android.gms:play-services-auth' as a dependency yet you will need to add it as a dependency in [your app build.gradle](example/android/app/build.gradle) as well - this is used to workaround SSL bugs for Android API16-20.

1. **Permissions** For Android 25+ you need to add REQUEST_INSTALL_PACKAGES to your [AndroidManifest.xml](example/android/app/src/main/AndroidManifest.xml)

**Please install and run the example to see how it works before opening issues**.
Then adapt it into your own app. Getting the versions right is tricky and setting up FileProviders is _very_ easy to do incorrectly, especially if using another module that defines one (like rn-fetch-blob)

## Usage

Please see [the example App.js](example/App.js) as it is very full featured and
has very thorough documentation about what each feature is for. You just need to check out the module from github, `cd example && npm install && npm start` then `react-native run-android` in another terminal with an emulator up to see everything in action.

## Changelog

See the [Changelog](CHANGELOG.md) on github

## Testing

This application has been tested on API16-API28 Android and will work for anything running API21+, plus any APIs between 16-20 that have Google Play Services. Specifically:

- API16 (Android 4.0) and up HTTP Updates + Emulators or Real Devices: works fine
- API21 (Android 5) and up HTTPS Updates + Emulators or Real Devices: works fine
- API16-API20 (Android 4.x) HTTPS Updates + Emulators: fails - platform SSL bug + no Google Play Services to patch it on these old emulators
- API16-API20 (Android 4.x) HTTPS Updates + Real Devices: works fine with Google Play Services to patch platform SSL bug

The only conditions where it won't work on real devices are for HTTPS updates to Android 4.x devices that do not have Google Play Services - a very very small percentage of the market at this point. Use HTTP if it is vital to reach those devices.

## Version JSON example

Note that you can host tests on dropbox.com using their "shared links", but if you do so
will need to put '?raw=1' at the end of the link they give you so you get the raw file contents
instead of a non-JSON XML document

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

- react-native-fs
