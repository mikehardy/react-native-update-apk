interface AppSpecification{firstInstallTime: string, lastUpdateTime: string, name: string}

export function getApps(): Promise<Array<AppSpecification>>;
export function getNonSystemApps(): Promise<Array<AppSpecification>>;
/**
 * Displayed version name (e.g. 1.0.0)
 */
export function getInstalledVersionName(): string;
/**
 * Build number/Version code (e.g. 1)
 */
export function getInstalledVersionCode(): string;
/**
 * Package name (e.g. io.codingspark.app)
 */
export function getInstalledPackageName(): string;
/**
 * First install timestamp (e.g. 1511326247)
 */
export function getInstalledFirstInstallTime(): number;
/**
 * Last update timestamp (e.g. 1511326247)
 */
export function getInstalledLastUpdateTime(): number;
export function getInstalledPackageInstaller(): string;
export function getInstalledSigningInfo(): Array<{
  issuer: string;
  serialNumber: string;
  signature: number;
  subject: string;
  thumbprint: string;
  toString: string;
}>;

export type UpdateAPKConstructorArgs = {
  /**
   * iOS App Store ID
   *
   * @see https://support.google.com/admob/answer/10038409
   */
  iosAppId?: string;

  /**
   * The URL to the remote JSON file that contains the latest version information.
   *
   * Sample file :
   * ```ts
   * {
   *   "versionName": "2.0.0",
   *   "apkUrl": "http://192.168.0.157:3000/build.apk",
   *   "forceUpdate": false,
   *   "whatsNew": "<< what changes the app update will bring >>"
   * }
   * ```
   */
  apkVersionUrl: string;

  /**
   * You should use it if you need to pass options to fetch request.
   */
  apkVersionOptions?: {
    method: string;
    headers: Record<string, string>;
  };

  /**
   * Complements or replaces the DownloadFileOptions (from react-native-fs) to download the new APK.
   *
   * By default the following options are already set: fromUrl, toFile, begin, progress, background and progressDivider
   * You should use it if you need to pass additional information (for example: headers) to download the new APK
   */
  apkOptions?: Record<string, string>;

  /**
   * The name of this `fileProviderAuthority` is defined in AndroidManifest.xml. **THEY MUST MATCH**.
   * By default other modules like rn-fetch-blob define one (conveniently named the same as below)
   * but if you don't match the names you will get an odd-looking XML exception:
   * `Attempt to invoke virtual method 'android.content.res.XmlResourceParser ....' on a null object reference`
   *
   * @example
   *
   *  {
   *    fileProviderAuthority ${UpdateAPK.getInstalledPackageName()}.provider`
   *  }
   *
   * @see https://github.com/mikehardy/react-native-update-apk/blob/main/example/android/app/src/main/AndroidManifest.xml
   */
  fileProviderAuthority: string;

  /**
   * This callback is called if there is a new version but it is not a forceUpdate.
   * Force update can be defined in the remote JSON with a boolean value.
   *
   * @example
   *
   * {
   *   "versionName": "2.0.0",
   *   "apkUrl": "http://192.168.0.157:3000/build.apk",
   *   "forceUpdate": false,
   *   "whatsNew": "<< what changes the app update will bring >>"
   * }
   *
   * @see {@link UpdateAPKConstructorArgs.forceUpdateApp} to hook on forced updates.
   */
  needUpdateApp(
    /**
     * This is a function that you should call when you want to start the update.
     * **You need to pass true, for some reasons otherwise it won't do anything**.
     */
    performUpdate: (shouldUpdate: boolean) => Promise<void>,
    /** The changelog defined in the remote file */
    changelog: string
  ): void;

  /**
   * This will be called before the download/update where you defined forceUpdate: true in the version JSON
   *
   * @see {@link UpdateAPKConstructorArgs.needUpdateApp} to hook on non-forced updates.
   */
  forceUpdateApp(): void;

  /**
   * This hooks trigger when the application is up to date and doesn't need to be updated.
   */
  notNeedUpdateApp(): void;

  /**
   * This is passed to react-native-fs as a callback, will trigger when the download starts.
   */
  downloadApkStart(): void;

  /**
   * Called with 0-99 for progress during the download.
   */
  downloadApkProgress(percent: number): void;

  /**
   * This is called prior to the update.
   * If you throw inside this it will abort the update
   *
   * Note: Async code is not supported here.
   */
  downloadApkEnd(): void;

  /**
   * This is called if the fetch of the version or the APK fails, so should be generic
   */
  onError(error: Error): void;
};

export class UpdateAPK {
  constructor(args: UpdateAPKConstructorArgs);
  /**
   * Check if there is a new version available
   */
  checkUpdate(): Promise<void>;
}