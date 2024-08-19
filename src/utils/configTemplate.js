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
      "android:androidManifest",
      "android:buildGradle",
      "android:icons",
      "android:splashScreen",
      "ios:xcconfig",
      "ios:buildTargets",
      "ios:plist",
      "ios:icons",
      "ios:launchScreen",
    ],
  };
}

module.exports = configTemplate;
