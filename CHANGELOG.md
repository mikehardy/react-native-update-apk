# Release Notes

## 4.2.0

- switch to yarn from npm

## 4.1.0

- Add cocoapods support / example fix for iOS

## 4.0.2

- Backwards-compatible support for react-native 0.60

## 4.0.1

- Allow seperate versioning for Play Services auth

## 4.0.0

- Altered return object shape of previous xxxApps() APIs to return more info

## 3.3.0

- Added getApps() and getNonSystemApps() to list installed packages

## 3.2.5

- Correctly call onError() when getApkInfo has a native error (like corrupt download)

## 3.2.4

- Enhanced the README, changed TODO to match current state of the project

## 3.2.3

- Continuing to add FileProvider example notes, better exception handling
  This is easily the part that can trip people up the most

## 3.2.2

- Added extensive notes to the example about purpose of each demonstrated feature
- Altered example FileProvider name to be consistent with rn-share-blob to help users

## 3.2.1

- Fix issue introduced in v3.0.0 with installing package on old devices
  This works now in my testing from API16 to API28, assuming API16-20 have Google Play
  Services if you want to download over SSL
- Switch to non-deprecated Play Services availability APIs

## 3.2.0

- Attempt to use Play Services to patch SSL for Android <5
- Example updated to show how to handle SSL download errors

## 3.1.1

- Fix (and upload) new example, with download progress

## 3.1.0

- Expose certificate signing info on installed and downloaded package

## 3.0.1

- Bugfix on FileProvider / API24 changes

## 3.0.0

- Use FileProvider so API24+ works
- Expose lots of information about the package

## 2.0.1

- Basically working post-fork
- Includes a usage example now

## 2.0.0

- First release post-fork - basic compilation, reorganization
