"use strict";

import { NativeModules, Platform } from "react-native";

const RNUpdateAPK = NativeModules.RNUpdateAPK;

let jobId = -1;

export class UpdateAPK {
  constructor(options) {
    this.options = options;
  }

  get = (url, success, error, options = {}) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        success && success(json);
      })
      .catch(err => {
        error && error(err);
      });
  };

  getApkVersion = () => {
    if (jobId !== -1) {
      return;
    }
    if (!this.options.apkVersionUrl) {
      console.log("RNUpdateAPK::getApkVersion - apkVersionUrl doesn't exist.");
      return;
    }
    this.get(
      this.options.apkVersionUrl,
      this.getApkVersionSuccess.bind(this),
      this.getVersionError.bind(this),
      this.options.apkVersionOptions
    );
  };

  getApkVersionSuccess = remote => {
    console.log("getApkVersionSuccess", remote);
    // TODO switch this to versionCode
    let outdated = false;
    if (remote.versionCode && (remote.versionCode > RNUpdateAPK.versionCode)) {
      console.log('RNUpdateAPK::getApkVersionSuccess - outdated based on code, local/remote: ' + RNUpdateAPK.versionCode + "/" + remote.versionCode);
      outdated = true;
    }
    if (!remote.versionCode && (RNUpdateAPK.versionName !== remote.versionName)) {
      console.log('RNUpdateAPK::getApkVersionSuccess - APK outdated based on version name, local/remote: ' + RNUpdateAPK.versionName + "/" + remote.versionName);
      outdated = true;
    }
    if (outdated) {
      if (remote.forceUpdate) {
        if (this.options.forceUpdateApp) {
          this.options.forceUpdateApp();
        }
        this.downloadApk(remote);
      } else if (this.options.needUpdateApp) {
        this.options.needUpdateApp(isUpdate => {
          if (isUpdate) {
            this.downloadApk(remote);
          }
        }, remote.whatsNew);
      }
    } else if (this.options.notNeedUpdateApp) {
      this.options.notNeedUpdateApp();
    }
  };

  downloadApk = remote => {
    const RNFS = require("react-native-fs");
    const progress = data => {
      const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      this.options.downloadApkProgress &&
        this.options.downloadApkProgress(percentage, data.contentLength, data.bytesWritten);
    };
    const begin = res => {
      console.log("RNUpdateAPK::downloadApk - downloadApkStart");
      this.options.downloadApkStart && this.options.downloadApkStart();
    };
    const progressDivider = 1;
    // You must be sure filepaths.xml exposes this path or you will have a FileProvider error API24+
    // You might check {totalSpace, freeSpace} = await RNFS.getFSInfo() to make sure there is room
    const downloadDestPath = `${RNFS.CachesDirectoryPath}/NewApp.apk`;

    let options = this.options.apkOptions ? this.options.apkOptions : {};

    const ret = RNFS.downloadFile(
      Object.assign(
        {
          fromUrl: remote.apkUrl,
          toFile: downloadDestPath,
          begin,
          progress,
          background: true,
          progressDivider
        },
        options
      )
    );

    jobId = ret.jobId;

    ret.promise
      .then(res => {
        if (res['statusCode'] >= 400 && res['statusCode'] <= 599){
          throw "Failed to Download APK. Server returned with " + res['statusCode'] + " statusCode";
        }
        console.log("RNUpdateAPK::downloadApk - downloadApkEnd");
        this.options.downloadApkEnd && this.options.downloadApkEnd();
        RNUpdateAPK.getApkInfo(downloadDestPath)
          .then(res => {
            console.log(
              "RNUpdateAPK::downloadApk - Old Cert SHA-256: " + RNUpdateAPK.signatures[0].thumbprint
            );
            console.log("RNUpdateAPK::downloadApk - New Cert SHA-256: " + res.signatures[0].thumbprint);
            if (
              res.signatures[0].thumbprint !==
              RNUpdateAPK.signatures[0].thumbprint
            ) {
              // FIXME should add extra callback for this
              console.log(
                "The signature thumbprints seem unequal. Install will fail"
              );
            }
          })
          .catch(rej => {
            console.log("RNUpdateAPK::downloadApk - apk info error: ", rej);
            this.options.onError && this.options.onError("Failed to get Downloaded APK Info");
            // re-throw so we don't attempt to install the APK, this will call the downloadApkError handler
            throw rej;
          });
        RNUpdateAPK.installApk(
          downloadDestPath,
          this.options.fileProviderAuthority
        );

        jobId = -1;
      })
      .catch(err => {
        this.downloadApkError(err);
        jobId = -1;
      });
  };

  getAppStoreVersion = () => {
    if (!this.options.iosAppId) {
      console.log("RNUpdateAPK::getAppStoreVersion - iosAppId doesn't exist.");
      return;
    }
    const URL = "https://itunes.apple.com/lookup?id=" + this.options.iosAppId;
    console.log("RNUpdateAPK::getAppStoreVersion - attempting to fetch " + URL);
    this.get(
      URL,
      this.getAppStoreVersionSuccess.bind(this),
      this.getVersionError.bind(this)
    );
  };

  getAppStoreVersionSuccess = data => {
    if (data.resultCount < 1) {
      console.log("RNUpdateAPK::getAppStoreVersionSuccess - iosAppId is wrong.");
      return;
    }
    const result = data.results[0];
    const version = result.version;
    const trackViewUrl = result.trackViewUrl;
    if (version !== RNUpdateAPK.versionName) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp(isUpdate => {
          if (isUpdate) {
            RNUpdateAPK.installFromAppStore(trackViewUrl);
          }
        });
      }
    }
  };

  getVersionError = err => {
    console.log("RNUpdateAPK::getVersionError - getVersionError", err);
    this.options.onError && this.options.onError(err);
  };

  downloadApkError = err => {
    console.log("RNUpdateAPK::downloadApkError - downloadApkError", err);
    this.options.onError && this.options.onError(err);
  };

  checkUpdate = () => {
    if (Platform.OS === "android") {
      this.getApkVersion();
    } else {
      this.getAppStoreVersion();
    }
  };
}

export function getInstalledVersionName() {
  return RNUpdateAPK.versionName;
}
export function getInstalledVersionCode() {
  return RNUpdateAPK.versionCode;
}
export function getInstalledPackageName() {
  return RNUpdateAPK.packageName;
}
export function getInstalledFirstInstallTime() {
  return RNUpdateAPK.firstInstallTime;
}
export function getInstalledLastUpdateTime() {
  return RNUpdateAPK.lastUpdateTime;
}
export function getInstalledPackageInstaller() {
  return RNUpdateAPK.packageInstaller;
}
export function getInstalledSigningInfo() {
  return RNUpdateAPK.signatures;
}
export async function getApps() {
  if (Platform.OS === "android") {
    return RNUpdateAPK.getApps();
  } else {
    return Promise.resolve([]);
  }
}
export async function getNonSystemApps() {
  if (Platform.OS === "android") {
    return RNUpdateAPK.getNonSystemApps();
  } else {
    return Promise.resolve([]);
  }
}
