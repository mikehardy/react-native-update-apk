#!/bin/bash
set -e 

echo "You should run this from directory where you have cloned the react-native-update-apk repo"
echo "You should only do this when your git working set is completely clean (e.g., git reset --hard)"
echo "You must have already run \`yarn\` in the repository so \`npx react-native\` will work"
echo "This scaffolding refresh has been tested on macOS, if you use it on linux, it might not work"

# Copy the important files out temporarily
if [ -d TEMP ]; then
  echo "TEMP directory already exists - we use that to store files while refreshing."
  exit 1
else
  echo "Saving files to TEMP while refreshing scaffolding..."
  mkdir -p TEMP/android/app/src/main/res/xml
  mkdir -p TEMP/android/keystores

  # This fixes possible build problems with ANDROID_SDK_HOME not specified
  cp example/android/local.properties TEMP/android/ || true

  # We have to provide File Provider information
  cp example/android/app/src/main/AndroidManifest.xml TEMP/android/app/src/main/ || true
  cp example/android/app/src/main/res/xml/filepaths.xml TEMP/android/app/src/main/res/xml/ || true

  # Our example app is different than the default example app naturally
  cp example/App.js TEMP/
  cp example/test-version.json TEMP/

  # Build is custom - Play services, and if you don't sign with the same key, updates will fail
  cp example/android/keystores/debug.keystore* TEMP/android/keystores/ || true
fi

# Purge the old sample
\rm -fr example

# Make the new example
npx react-native init example
pushd example
yarn add https://github.com/mikehardy/react-native-update-apk.git
yarn add react-native-fs

sed -i -e $'s/ext {$/ext {\\\n        supportLibVersion = "1.1.0"/' android/build.gradle
sed -i -e $'s/ext {$/ext {\\\n        appCompatVersion = "1.1.0"/' android/build.gradle
rm -f android/build.gradle??

sed -i -e $'s/storeFile file(\'debug.keystore\')/storeFile rootProject.file("keystores\/debug.keystore")/' android/app/build.gradle


# Copy the important files back in
popd
echo "Copying update-apk example files into refreshed example..."
cp -frv TEMP/* example/

# Clean up after ourselves
\rm -fr TEMP
