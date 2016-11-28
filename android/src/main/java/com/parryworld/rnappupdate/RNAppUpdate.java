package com.parryworld.rnappupdate;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by parryworld on 2016/11/18.
 */

public class RNAppUpdate extends ReactContextBaseJavaModule {

    private String versionName = "1.0.0";
    private int versionCode = 1;

    public RNAppUpdate(ReactApplicationContext reactContext) {
        super(reactContext);
        PackageInfo pInfo = null;
        try {
            pInfo = reactContext.getPackageManager().getPackageInfo(reactContext.getPackageName(), 0);
            versionName = pInfo.versionName;
            versionCode = pInfo.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return "RNAppUpdate";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("versionName", versionName);
        constants.put("versionCode", versionCode);
        return constants;
    }

    @ReactMethod
    public void installApk(String file) {
        String cmd = "chmod 777 " + file;
        try {
            Runtime.getRuntime().exec(cmd);
        } catch (Exception e) {
            e.printStackTrace();
        }
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setDataAndType(Uri.parse("file://" + file), "application/vnd.android.package-archive");
        getCurrentActivity().startActivity(intent);
    }
}
