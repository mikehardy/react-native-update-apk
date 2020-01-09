package net.mikehardy.rnupdateapk;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.FileProvider;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.security.ProviderInstaller;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.common.IntentSenderForResultStarter;
import com.google.android.play.core.install.InstallState;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.play.core.tasks.Task;

public class RNUpdateAPK extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNUpdateAPK(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNUpdateAPK";
    }

    @SuppressLint("PackageManagerGetSignatures")
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        PackageManager pManager = reactContext.getPackageManager();
        PackageInfo pInfo;
        try {
            pInfo = pManager.getPackageInfo(reactContext.getPackageName(), PackageManager.GET_SIGNATURES);
            constants.put("versionName", pInfo.versionName);
            constants.put("versionCode", pInfo.versionCode);
            constants.put("packageName", pInfo.packageName);
            constants.put("firstInstallTime", pInfo.firstInstallTime);
            constants.put("lastUpdateTime", pInfo.lastUpdateTime);
            constants.put("packageInstaller", pManager.getInstallerPackageName(pInfo.packageName));
            constants.put("signatures", getPackageSignatureInfo(pInfo));
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        return constants;
    }

    private WritableArray getPackageSignatureInfo(PackageInfo pInfo) {
        WritableArray signaturesReturn = Arguments.createArray();
        final Signature[] arrSignatures = pInfo.signatures;
        for (Signature sig : arrSignatures) {
            final byte[] rawCert = sig.toByteArray();
            WritableMap signatureReturn = Arguments.createMap();

            InputStream certStream = new ByteArrayInputStream(rawCert);
            try {
                CertificateFactory certFactory = CertificateFactory.getInstance("X509");
                X509Certificate x509Cert = (X509Certificate) certFactory.generateCertificate(certStream);
                signatureReturn.putString("subject", x509Cert.getSubjectDN().toString());
                signatureReturn.putString("issuer", x509Cert.getIssuerDN().toString());
                signatureReturn.putString("serialNumber", x509Cert.getSerialNumber().toString());
                signatureReturn.putInt("signature", sig.hashCode());
                signatureReturn.putString("toString", x509Cert.toString());
                signatureReturn.putString("thumbprint", getThumbprint(x509Cert));
            } catch (Exception e) {
                e.printStackTrace();
            }
            signaturesReturn.pushMap(signatureReturn);
        }
        return signaturesReturn;
    }

    private static String getThumbprint(X509Certificate cert) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] der = cert.getEncoded();
        md.update(der);
        byte[] bytes = md.digest();
        StringBuilder sb = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            sb.append("0123456789ABCDEF".charAt((b & 0xF0) >> 4));
            sb.append("0123456789ABCDEF".charAt((b & 0x0F)));
        }
        String hex = sb.toString();
        return hex.toLowerCase();
    }

    @ReactMethod
    public void getApkInfo(String apkPath, Promise p) {
        try {
            PackageManager pManager = reactContext.getPackageManager();
            PackageInfo pInfo = pManager.getPackageArchiveInfo(apkPath, PackageManager.GET_SIGNATURES);
            WritableMap apkInfo = Arguments.createMap();
            apkInfo.putString("versionName", pInfo.versionName);
            apkInfo.putInt("versionCode", pInfo.versionCode);
            apkInfo.putString("packageName", pInfo.packageName);
            apkInfo.putString("packageInstaller", pManager.getInstallerPackageName(pInfo.packageName));
            apkInfo.putArray("signatures", getPackageSignatureInfo(pInfo));
            p.resolve(apkInfo);
        } catch (Exception e) {
            p.reject(e);
        }
    }

    @ReactMethod
    public void installApk(String filePath, String fileProviderAuthority) {

        File file = new File(filePath);
        if (!file.exists()) {
            Log.e("RNUpdateAPK", "installApk: file doe snot exist '" + filePath + "'");
            // FIXME this should take a promise and fail it
            return;
        }

        if (Build.VERSION.SDK_INT >= 24) {
            // API24 and up has a package installer that can handle FileProvider content:// URIs
            Uri contentUri;
            try {
                contentUri = FileProvider.getUriForFile(getReactApplicationContext(), fileProviderAuthority, file);
            } catch (Exception e) {
                // FIXME should be a Promise.reject really
                Log.e("RNUpdateAPK", "installApk exception with authority name '" + fileProviderAuthority + "'", e);
                throw e;
            }
            Intent installApp = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            installApp.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            installApp.setData(contentUri);
            installApp.putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, reactContext.getApplicationInfo().packageName);
            reactContext.startActivity(installApp);
        } else {
            // Old APIs do not handle content:// URIs, so use an old file:// style
            String cmd = "chmod 777 " + file;
            try {
                Runtime.getRuntime().exec(cmd);
            } catch (Exception e) {
                e.printStackTrace();
            }
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setDataAndType(Uri.parse("file://" + file), "application/vnd.android.package-archive");
            reactContext.startActivity(intent);
        }
    }

    @ReactMethod
    public void patchSSLProvider(boolean force, boolean dialogIfRepairable, Promise p) {

        // This is unnecessary for Android API20+, skip unless forced
        if (!force && Build.VERSION.SDK_INT > 20) {
            p.resolve(true);
            return;
        }

        try {
            ProviderInstaller.installIfNeeded(reactContext);
            p.resolve(true);
        } catch (GooglePlayServicesRepairableException e) {
            // Thrown when Google Play Services is not installed, up-to-date, or enabled
            // Show dialog to allow users to install, update, or otherwise enable Google Play services.
            if (dialogIfRepairable) {
                GoogleApiAvailability.getInstance().getErrorDialog(getCurrentActivity(), e.getConnectionStatusCode(), 0);
            }
            String message = "Google Play Services repairable but not usable right now";
            Log.e("SecurityException", message);
            p.reject(new Throwable(message));
        } catch (GooglePlayServicesNotAvailableException e) {
            String message = "Google Play Services not available";
            Log.e("SecurityException", message);
            p.reject(new Throwable(message));
        }
    }

    @ReactMethod
    public void getApps(Promise p) {
        List<PackageInfo> packages = reactContext.getPackageManager().getInstalledPackages(0);

        WritableArray ret = Arguments.createArray();
        for (final PackageInfo pi : packages) {
            WritableMap retPackage = Arguments.createMap();
            retPackage.putString("name", pi.packageName);
            retPackage.putString("firstInstallTime", Long.toString(pi.firstInstallTime));
            retPackage.putString("lastUpdateTime", Long.toString(pi.lastUpdateTime));
            ret.pushMap(retPackage);
        }
        p.resolve(ret);
    }

    @ReactMethod
    public void getNonSystemApps(Promise p) {
        List<PackageInfo> packages = reactContext.getPackageManager().getInstalledPackages(0);

        WritableArray ret = Arguments.createArray();
        for (final PackageInfo pi : packages) {
            if ((pi.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                WritableMap retPackage = Arguments.createMap();
                retPackage.putString("name", pi.packageName);
                retPackage.putString("firstInstallTime", Long.toString(pi.firstInstallTime));
                retPackage.putString("lastUpdateTime", Long.toString(pi.lastUpdateTime));
                ret.pushMap(retPackage);
            }
        }
        p.resolve(ret);
    }

    private static final int REQ_CODE_VERSION_UPDATE = 530;
    private AppUpdateManager appUpdateManager;
    private InstallStateUpdatedListener installStateUpdatedListener;

    @ReactMethod
    private void checkForAppUpdate(Promise p) {
        // Creates instance of the manager.
        appUpdateManager = AppUpdateManagerFactory.create(reactContext);

        // Returns an intent object that you use to check for an update.
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();

        // Create a listener to track request state updates.
        installStateUpdatedListener = new InstallStateUpdatedListener() {
            @Override
            public void onStateUpdate(InstallState installState) {
                // Show module progress, log state, or install the update.
                if (installState.installStatus() == InstallStatus.DOWNLOADED) {
                    // After the update is downloaded, show a notification
                    // and request user confirmation to restart the app.
//                    popupSnackbarForCompleteUpdateAndUnregister();
                    unregisterInstallStateUpdListener();
                    p.resolve(InstallStatus.DOWNLOADED);
                }
            }
        };

        // Checks that the platform will allow the specified type of update.
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            int availability = appUpdateInfo.updateAvailability();
            if (availability == UpdateAvailability.UPDATE_AVAILABLE) {
                // Request the update.
                if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {

                    // Before starting an update, register a listener for updates.
                    appUpdateManager.registerListener(installStateUpdatedListener);
                    // Start an update.
                    startAppUpdateFlexible(appUpdateInfo);
                } else if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE) ) {
                    // Start an update.
                    startAppUpdateImmediate(appUpdateInfo);
                }
            }
            else if (availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS){
                unregisterInstallStateUpdListener();
                p.resolve(InstallStatus.DOWNLOADED);
            }
        });
        appUpdateInfoTask.addOnFailureListener(info -> {
            Log.w("update failed", info);
        });
    }

    @ReactMethod
    private void startAppUpdateImmediate(AppUpdateInfo appUpdateInfo) {
        try {
            appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    AppUpdateType.IMMEDIATE,
                    // The current activity making the update request.
                    this.reactContext.getCurrentActivity(),
                    // Include a request code to later monitor this update request.
                    REQ_CODE_VERSION_UPDATE);
        } catch (IntentSender.SendIntentException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    private void startAppUpdateFlexible(AppUpdateInfo appUpdateInfo) {
        try {
            appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    AppUpdateType.FLEXIBLE,
                    // The current activity making the update request.
                    this.reactContext.getCurrentActivity(),
                    // Include a request code to later monitor this update request.
                    REQ_CODE_VERSION_UPDATE);
        } catch (IntentSender.SendIntentException e) {
            e.printStackTrace();
            unregisterInstallStateUpdListener();
        }
    }

    @ReactMethod
    public void completeUpdate(){
        appUpdateManager.completeUpdate();
    }

    /**
     * Displays the snackbar notification and call to action.
     * Needed only for Flexible app update
     */
//    private void popupSnackbarForCompleteUpdateAndUnregister() {
//        Snackbar snackbar =
//                Snackbar.make(drawerLayout, getString(R.string.update_downloaded), Snackbar.LENGTH_INDEFINITE);
//        snackbar.setAction(R.string.restart, new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                appUpdateManager.completeUpdate();
//            }
//        });
//        snackbar.setActionTextColor(getResources().getColor(R.color.action_color));
//        snackbar.show();
//
//        unregisterInstallStateUpdListener();
//    }

    /**
     * Checks that the update is not stalled during 'onResume()'.
     * However, you should execute this check at all app entry points.
     */
    @ReactMethod
    private void checkNewAppVersionState(Promise p) {
        appUpdateManager
                .getAppUpdateInfo()
                .addOnSuccessListener(
                        appUpdateInfo -> {
                            //FLEXIBLE:
                            // If the update is downloaded but not installed,
                            // notify the user to complete the update.
                            if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
//                                popupSnackbarForCompleteUpdateAndUnregister();
                                p.resolve(InstallStatus.DOWNLOADED);
                            }

                            //IMMEDIATE:
                            if (appUpdateInfo.updateAvailability()
                                    == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                                // If an in-app update is already running, resume the update.
                                startAppUpdateImmediate(appUpdateInfo);
                            }
                        });

    }

    /**
     * Needed only for FLEXIBLE update
     */
    private void unregisterInstallStateUpdListener() {
        if (appUpdateManager != null && installStateUpdatedListener != null)
            appUpdateManager.unregisterListener(installStateUpdatedListener);
    }
}
