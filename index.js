"use strict";

import { NativeModules, Platform } from "react-native";

const RNUpdateAPK = NativeModules.RNUpdateAPK;

let jobId = -1;

export class UpdateAPK {
  constructor(options) {
    this.options = options;
  }

  GET = (url, success, error) => {
    fetch(url)
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
      console.log("apkVersionUrl doesn't exist.");
      return;
    }
    this.GET(
      this.options.apkVersionUrl,
      this.getApkVersionSuccess.bind(this),
      this.getVersionError.bind(this)
    );
  };

  getApkVersionSuccess = remote => {
    console.log("getApkVersionSuccess", remote);
    if (RNUpdateAPK.versionName !== remote.versionName) {
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
        });
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
        this.options.downloadApkProgress(percentage);
    };
    const begin = res => {
      console.log("downloadApkStart");
      this.options.downloadApkStart && this.options.downloadApkStart();
    };
    const progressDivider = 1;
    // You must be sure filepaths.xml exposes this path or you will have a FileProvider error API24+
    // You might check {totalSpace, freeSpace} = await RNFS.getFSInfo() to make sure there is room
    const downloadDestPath = `${RNFS.CachesDirectoryPath}/NewApp.apk`;

    const ret = RNFS.downloadFile({
      fromUrl: remote.apkUrl,
      toFile: downloadDestPath,
      begin,
      progress,
      background: true,
      progressDivider
    });

    jobId = ret.jobId;

    ret.promise
      .then(res => {
        console.log("downloadApkEnd");
        this.options.downloadApkEnd && this.options.downloadApkEnd();
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
      console.log("iosAppId doesn't exist.");
      return;
    }
    const URL =
      "https://itunes.apple.com/us/app/apple-store/id" +
      this.options.iosAppId +
      "?mt=8";
    console.log("attempting to fetch " + URL);
    this.GET(
      URL,
      this.getAppStoreVersionSuccess.bind(this),
      this.getVersionError.bind(this)
    );
  };

  getAppStoreVersionSuccess = data => {
    if (data.resultCount < 1) {
      console.log("iosAppId is wrong.");
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
    console.log("getVersionError", err);
    this.options.onError && this.options.onError(err);
  };

  downloadApkError = err => {
    console.log("downloadApkError", err);
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
