function configTemplate() {
  return {
    app: {
      android: {
        flavorDimensions: "dimensions-app",
      },
      ios: {
        buildSettings: {
          IPHONEOS_DEPLOYMENT_TARGET: "13.0",
          MINIMUM_IPHONEOS_VERSION: "13.0",
        },
      },
    },
    flavors: [
      {
        flavorName: "flavorname",
        app: {
          name: "App Name",
          icon: "path/to/your/icon.png",
        },
        android: {
          applicationId: "com.example.app",
        },
        ios: {
          bundleId: "com.example.app",
          buildSettings: {
            DEVELOPMENT_TEAM: "ABCDEFGHIJ",
          },
        },
      },
    ],
    instructions: [
      "assets:download",
      "assets:extract",
      "android:androidManifest",
      "android:buildGradle",
      "android:dummyAssets",
      "android:icons",
      "reactnative:flavors",
      "reactnative:app",
      "reactnative:pages",
      "reactnative:main",
      "reactnative:targets",
      "ios:xcconfig",
      "ios:buildTargets",
      "ios:schema",
      "ios:dummyAssets",
      "ios:icons",
      "ios:plist",
      "ios:launchScreen",
      "google:firebase",
      "assets:clean",
      "ide:config",
    ],
  };
}

module.exports = configTemplate;
