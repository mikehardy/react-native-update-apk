# Release Notes

## 4.4.0

-- feat: add apkVersionOptions for custom HTTP method/headers (#33, thanks @rejunges!)
-- feat: add whatsNew to version object definition (#32, thanks @bshubham80!)
-- fix: use different / more generic URL for iOS app lookup (#30, thanks @jiapeng007!)

## 4.3.2

-- fix: Capital GET breaks babel compile (#28, thanks @gstcyr!)

## 4.3.1

-- fix: obtain android appcompat library from appCompatVersion gradle variable if possible (@mikehardy)
-- chore: update dependencies (@mikehardy)

## 4.3.0

- feat: expose content length and bytes written to progress call back as args 2 & 3 (thanks @cani1see!)
- fix: use implementation vs compileOnly for android react-native dep (thanks @ilianamarcano!)

## 4.2.1

- fix: 'np' package should be a dev dependency (thanks @nuKs!)
- chore: update refresh-example to use modern android libraries
- chore: update example using refresh-example

## 4.2.0

- feat: compare by version code first, fallback to version name (Fixes #9)
- fix: handle openURL deprecation warning with iOS9 protection (Fixes #15)
- fix: attempt fix onError() not called when reading APK info fails after download (Fixes #14)
- fix: attempt to eliminate main queue setup warning in iOS
- build: only define android project for module maintenance, not in projects (https://github.com/react-native-community/discussions-and-proposals/issues/151#issuecomment-532787908)
- chore: prefix all log output with `RNUpdateAPK::<method name>`
- chore: switch to yarn from npm

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
