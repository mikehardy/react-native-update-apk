#!/bin/bash
pushd example
mkdir -p android/app/src/main/assets/
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
