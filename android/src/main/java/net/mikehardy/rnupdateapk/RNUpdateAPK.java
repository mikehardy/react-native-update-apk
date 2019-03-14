package net.mikehardy.rnupdateapk;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.v4.content.FileProvider;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class RNUpdateAPK extends ReactContextBaseJavaModule {

    private ReactApplicationContext reactContext;

    public RNUpdateAPK(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNUpdateAPK";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        PackageManager pManager = reactContext.getPackageManager();
        PackageInfo pInfo;
        try {
            pInfo = pManager.getPackageInfo(reactContext.getPackageName(), 0);
            constants.put("versionName", pInfo.versionName);
            constants.put("versionCode", pInfo.versionCode);
            constants.put("packageName", pInfo.packageName);
            constants.put("firstInstallTime", pInfo.firstInstallTime);
            constants.put("lastUpdateTime", pInfo.lastUpdateTime);
            constants.put("packageInstaller", pManager.getInstallerPackageName(pInfo.packageName));
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        return constants;
    }

    @ReactMethod
    public void installApk(String filePath, String fileProviderAuthority) {

        File file = new File(filePath);
        if (!file.exists()) {
            Log.e("RNUpdateAPK", "installApk: file doe snot exist '" + filePath + "'");
            // FIXME this should take a promise and fail it
            return;
        }
        Uri contentUri = FileProvider.getUriForFile(getReactApplicationContext(), fileProviderAuthority, file);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
        getCurrentActivity().startActivity(intent);
    }
}
