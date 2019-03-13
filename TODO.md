# TODO - ideas about ways to make this more useful

## Give the user more information about how to enable updates

If the user has not enabled unknown app sources, they may need to do so, and you can advise them and send them directly to the system GUI pre-loaded with your package: [doc link here](https://developer.android.com/reference/android/provider/Settings.html#ACTION_MANAGE_UNKNOWN_APP_SOURCES)

## Alter the way we install packages (or at least investigate it)

Currently we are using a view like this:

```java
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
        getCurrentActivity().startActivity(intent);
```

It might be better to do an [Intent.ACTION_INSTALL_PACKAGE?](<<https://developer.android.com/reference/android/content/Intent.html#ACTION_INSTALL_PACKAGE()>)> "but only if you hole the [right permissions](https://developer.android.com/reference/android/Manifest.permission.html#REQUEST_INSTALL_PACKAGES") while being careful to [check if the permission was granted(https://developer.android.com/reference/android/content/pm/PackageInfo.html#requestedPermissionsFlags)

## Enable much more information about the current package and it's abilities

- Should show if it [can even request package installs](<https://developer.android.com/reference/android/content/pm/PackageManager.html#canRequestPackageInstalls()>) and if it has permissions (see link above)
- Should be possible to show [who installed current package](<https://developer.android.com/reference/android/content/pm/PackageManager.html#getInstallerPackageName(java.lang.String)>)
- Should be possible to show [everything about the current package](<https://developer.android.com/reference/android/content/pm/PackageManager.html#getPackageInfo(java.lang.String,%20int)>)
- it is possible for necessary permissions to be [revoked by policy and thus not even available](<https://developer.android.com/reference/android/content/pm/PackageManager.html#isPermissionRevokedByPolicy(java.lang.String,%20java.lang.String)>) we could help with messaging in that instance

## For newer Android APIs (21+) maybe use Package Installer

- <https://developer.android.com/reference/android/content/pm/PackageManager.html#getPackageInstaller()>
- <https://developer.android.com/reference/android/content/pm/PackageInstaller.html>
