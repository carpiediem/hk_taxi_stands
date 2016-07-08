# HK Taxi Stands

## Introduction
HK Taxi Stands is a hybrid mobile app built on the Ionic Framework, which uses AngularJS and Cordova.  It maps the location of nearly 500 taxi stands throughout the Hong Kong SAR.

This repository has two branches:

* `master` is under active development, using the [angular-google-maps](http://angular-ui.github.io/angular-google-maps/#!/) directive.
* `offline_variation` was built with [angular-leaflet-directive](http://tombatossals.github.io/angular-leaflet-directive/#!/) and many PNG maps tiles from [TileMill](https://www.mapbox.com/tilemill/), but work was halted due to [an event listener bug](https://github.com/tombatossals/angular-leaflet-directive/issues/1124).

## Releases
An Android release will be available on the Google Play Store soon.  If you have an iOS device, you can try out the app using Ionic View.

### Ionic View
1. Install the Ionic View app on your mobile device: [iOS](https://itunes.apple.com/us/app/ionic-view/id849930087?mt=8), [Android](https://play.google.com/store/apps/details?id=com.ionic.viewapp)
2. Create an account within the Ionic View app
3. TBD
4. Find the *HK Taxi Stands* box within the Ionic View app and tap it to open a context menu
5. Tap *Download files* or *Sync to latest* to ensure that you have the most recent version
4. Tap the *View app* button to launch

## Dependencies
These software packages are required to build or modify the hk_taxi_stands codebase.

### Software
* [Node.js v4](https://nodejs.org/download/)
* [Ionic Framework v1.2](http://ionicframework.com/docs/guide/installation.html) (includes Cordova)
* [Android SDK](http://developer.android.com/sdk/installing/index.html?pkg=tools) or all of [Android Studio](http://developer.android.com/sdk/installing/index.html?pkg=studio) (only if you need to build for Android devices, emulators, or stores)
* [Xcode](https://developer.apple.com/xcode/ide/) (only if you need to build for iOS devices, emulators, or iTunes)
* [git](https://git-scm.com/downloads) or [SourceTree](https://www.sourcetreeapp.com/) (unless you want to [download as a ZIP file](https://bitbucket.org/gbstbsd/opsmanager/downloads))

### [Node Packages](https://www.npmjs.com/)
bower, express, heroku-ssl-redirect, gulp, gulp-concat, gulp-minify-css, gulp-rename, gulp-sass, gulp-util, jshint, shelljs (see [package.json](package.json))

### [Cordova Plugins](https://cordova.apache.org/plugins/)
cordova-plugin-device, cordova-plugin-console, cordova-plugin-whitelist, cordova-plugin-splashscreen, cordova-plugin-geolocation, com.ionic.keyboard (see [package.json](package.json))

### [Bower Components](http://bower.io/search/)
angular, angular-google-maps, ionic, ngCordova, angular-csv-service, lodash, restangular (see [bower.json](bower.json))

## Local Development Setup
1. Install [the software listed above](#software)
2. Globally install the cordova & ionic Node.js packages by executing `npm install -g cordova ionic`
3. Use git to clone this repository to your machine: `git clone https://github.com/carpiediem/hk_taxi_stands.git`
4. Navigate your command line to the `hk_taxi_stands` directory
5. Install dependencies and clean out the `/www` directory by executing `npm install`
6. Run the app in a browser by executing `ionic serve`

## Configuration
This app's configuration generally matches the defaults for Ionic projects.

## Build
The `npm install` command should have added cordova platforms automatically, but if the repository is still missing a `/platforms` directory, just execute `ionic platform add ios` or `ionic platform add android`.  Remember that you'll need to install the appropriate SDKs first.

* To build a .APK file for Android devices, execute `ionic build android`
* To build a .APP file for iOS devices, execute `ionic build ios`

## Testing

### Unit Tests
Currently, no tests have been established.

### Emulation
Integration testing on device emulators is also useful before deployment.  Xcode & Android Studio both provide emulators that can be launched by executing `ionic emulate ios` or `ionic emulate android`.  But,  [Genymotion](https://www.genymotion.com/) tends to give better performance.

To install the app on Genymotion, [launch a virtual device](http://www.thedevline.com/2014/04/how-to-set-up-genymotion-fast-easy.html), then drag an APK file icon into the emulator window.
Android emulators can be discovered as devices in Google's Chrome browser, which allows for [easy debugging in the JavaScript console](http://gonzalo123.com/2014/08/04/debugging-android-cordovaphonegap-apps-with-chrome/).  Xcode has a similar feature for iOS builds.

### Android Debug Bridge
If you have the Android SDK installed, it should include the `adb` shell command to sideload existing .APK files onto a physical device.  You'll need to put your device into developer mode for it to allow connections with adb.  Remember to uninstall previous versions of the app before installing an update.

```shell
ionic build android
adb uninstall us.rslc.hk_taxi_stands
adb install platforms\android\build\outputs\apk\android-debug.apk
```

If your system is able to build the project, you can also just plug in your device and execute `ionic run android`.  As with the emulator, the Chrome browser can be used to debug the app if it is run on a device that is connected by USB.  You can also debug the app by enabling logging in the shell: `ionic run android -l -c -s`.

## Team
The project team is led by [Ryan Carpenter](carpiediem@gmail.com).

## Links
* Further documentation can be found for each of the libraries used in this project: [ionic](http://ionicframework.com/docs/components/), [cordova/phonegap](http://cordova.apache.org/docs/en/latest/guide/overview/), [angular](https://docs.angularjs.org/guide), [nvd3](http://krispo.github.io/angular-nvd3/), [gulp](https://www.codefellows.org/blog/quick-intro-to-gulp-js), [sass](http://sass-lang.com/guide)
* Two web apps were used to generate image files for [Android](http://romannurik.github.io/AndroidAssetStudio/index.html) & [iOS](http://makeappicon.com/) icons
