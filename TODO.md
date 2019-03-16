# TODO - ideas about ways to make this more useful

## Be nicer about data usage

- Bundle in react-native-community/netinfo and check if we are online and unmetered?
- Add ability to compare hashes on downloads
- Add ability to do incremental downloads
- Name the file appropriately (and unlink it when done!!)
- Add ability to do differential updates?

## Store information about the upgrade itself

- what version it was last on, any downloaded versions that were updated (full list maybe)
- information about how many times a given update was attempted, if it was successful etc

## Give the user more information about how to enable updates

If the user has not enabled unknown app sources, they may need to do so, and you can advise them and send them directly to the system GUI pre-loaded with your package: [doc link here](https://developer.android.com/reference/android/provider/Settings.html#ACTION_MANAGE_UNKNOWN_APP_SOURCES)

## Enable much more information about the current package and it's abilities

- [check if the permission was granted(<https://developer.android.com/reference/android/content/pm/PackageInfo.html#requestedPermissionsFlags>)
- Should show if it [can even request package installs](<https://developer.android.com/reference/android/content/pm/PackageManager.html#canRequestPackageInstalls()>) and if it has permissions (see link above)
- Should be possible to show [everything about the current package](<https://developer.android.com/reference/android/content/pm/PackageManager.html#getPackageInfo(java.lang.String,%20int)>)
- it is possible for necessary permissions to be [revoked by policy and thus not even available](<https://developer.android.com/reference/android/content/pm/PackageManager.html#isPermissionRevokedByPolicy(java.lang.String,%20java.lang.String)>) we could help with messaging in that instance

## Android Q will require a change I believe? They deprecated one of the APIs
