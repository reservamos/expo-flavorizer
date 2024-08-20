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
        flavorName: "apple",
        appName: "Apple App",
        defaultIcon: "path/to/your/default-icon.png",
        android: {
          applicationId: "com.example.apple",
          adaptiveIcon: {
            background: "path/to/your/background-image.png",
            foreground: "path/to/your/foreground-image.png",
            foregroundScale: "0.6",
          },
          splash: {
            image: "path/to/your/foreground-image.png",
            imageScale: "0.6",
            imageWidth: "300",
            imageHeight: "300",
            resizeMode: "cover",
            backgroundColor: "#C35955",
          },
        },
        ios: {
          bundleId: "com.example.apple",
          launchScreen: {
            backgroundColor: "#C35955",
            image: "path/to/your/foreground-image.png",
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
      "ios:podfile",
      "ios:buildTargets",
      "ios:plist",
      "ios:icons",
      "ios:launchScreen",
    ],
  };
}

module.exports = configTemplate;
