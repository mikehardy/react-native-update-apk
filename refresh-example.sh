#!/bin/bash
set -e 

echo "You should run this from directory where you have cloned the react-native-update-apk repo"
echo "You should only do this when your git working set is completely clean (e.g., git reset --hard)"
echo "You must have already run \`npm install\` in the repository so \`npx react-native\` will work"
echo "This scaffolding refresh has been tested on macOS, if you use it on linux, it might not work"

# Copy the important files out temporarily
if [ -d TEMP ]; then
  echo "TEMP directory already exists - we use that to store files while refreshing."
  exit 1
else
  echo "Saving files to TEMP while refreshing scaffolding..."
  mkdir -p TEMP/android/app/src/main/res/xml
  cp example/android/local.properties TEMP/android/ || true
  cp example/android/app/src/main/AndroidManifest.xml TEMP/android/app/src/main/ || true
  cp example/android/app/src/main/res/xml/filepaths.xml TEMP/android/app/src/main/res/xml/ || true
  cp example/App.js TEMP/
  cp example/test-version.json TEMP/
fi

# Purge the old sample
\rm -fr example

# Make the new example
npx react-native init example
pushd example
npm install https://github.com/mikehardy/react-native-update-apk.git
npx react-native link rn-update-apk
npx react-native link react-native-fs

# Copy the important files back in
popd
echo "Copying update-apk example files into refreshed example..."
cp -frv TEMP/* example/

# Clean up after ourselves
\rm -fr TEMP
