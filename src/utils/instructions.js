const fs = require("fs");
const configLoader = require("../utils/configLoader");
const AndroidManifestProcessor = require("../processors/android/manifestProcessor");
const AndroidBuildGradleProcessor = require("../processors/android/buildGradleProcessor");
const AndroidClassicIconProcessor = require("../processors/android/classicIconProcessor");
const AndroidClassicRoundedIconProcessor = require("../processors/android/classicRoundedIconProcessor");
const AndroidAdaptiveIconProcessor = require("../processors/android/adaptiveIconProcessor");
const AndroidSplashScreenProcessor = require("../processors/android/splashScreenProcessor");
const IosIconProcessor = require("../processors/ios/iconProcessor");
const IosLaunchScreenProcessor = require("../processors/ios/launchScreenProcessor");
const IosSchemasProcessor = require("../processors/ios/schemasProcessor");
const IosBuildConfigurationsProcessor = require("../processors/ios/buildConfigurationsProcessor");
const IosPodfileProcessor = require("../processors/ios/podfileProcessor");
const IosBuildTargetsProcessor = require("../processors/ios/buildTargetsProcessor");
const IosXcConfigProcessor = require("../processors/ios/xcConfigProcessor");

async function applyInstructions(configFilePath) {
  const config = configLoader(configFilePath);
  for (const instruction of config.instructions) {
    switch (instruction) {
      case "android:androidManifest":
        try {
          console.log("Updating AndroidManifest...");
          const androidManifest = fs.readFileSync(
            `${process.cwd()}/android/app/src/main/AndroidManifest.xml`,
            "utf8"
          );
          const updatedAndroidMAnifest = await AndroidManifestProcessor(
            androidManifest,
            config
          );
          fs.writeFileSync(
            `${process.cwd()}/android/app/src/main/AndroidManifest.xml`,
            updatedAndroidMAnifest
          );
          console.log(`✅ AndroidManifest updated!\n`);
        } catch (error) {
          console.error("❌ Error updating AndroidManifest:", error, "\n");
        }
        break;
      case "android:buildGradle":
        try {
          console.log("Updating build.gradle...");
          const buildGradle = fs.readFileSync(
            `${process.cwd()}/android/app/build.gradle`,
            "utf8"
          );
          const updatedBuildGradle = await AndroidBuildGradleProcessor(
            buildGradle,
            config
          );
          fs.writeFileSync(
            `${process.cwd()}/android/app/build.gradle`,
            updatedBuildGradle
          );
          console.log(`✅ build.gradle updated!\n`);
        } catch (error) {
          console.error("❌ Error updating build.gradle:", error, "\n");
        }
        break;
      case "android:icons":
        try {
          console.log("Updating android icons...");
          await AndroidClassicIconProcessor(config);
          console.log(`✅ Android classic icons updated!`);
          await AndroidClassicRoundedIconProcessor(config);
          console.log(`✅ Android rounded icons updated!`);
          await AndroidAdaptiveIconProcessor(config);
          console.log(`✅ Android adaptive icons updated!\n`);
        } catch (error) {
          console.error("❌ Error updating android icons:", error, "\n");
        }
        break;
      case "android:splashScreen":
        try {
          console.log("Updating android splash screen...");
          await AndroidSplashScreenProcessor(config);
          console.log(`✅ Android splash screen updated!\n`);
        } catch (error) {
          console.error("❌ Error updating splash screen:", error, "\n");
        }
        break;
      case "ios:xcconfig":
        try {
          console.log("Updating xcconfig...");
          await IosXcConfigProcessor(config);
          console.log(`✅ XcConfig updated!\n`);
        } catch (error) {
          console.error("❌ Error updating xcconfig:", error, "\n");
        }
        break;
      case "ios:podfile":
        try {
          console.log("Updating podfile...");
          await IosPodfileProcessor(null, config);
          console.log(`✅ Podfile updated!\n`);
        } catch (error) {
          console.error("❌ Error updating podfile:", error, "\n");
        }
        break;
      case "ios:buildTargets":
        try {
          console.log("Updating buildTargets...");
          await IosBuildTargetsProcessor(config);
          console.log(`✅ BuildTargets updated!\n`);
        } catch (error) {
          console.error("❌ Error updating buildTargets:", error, "\n");
        }
        break;
      case "ios:plist":
        // console.log("Updating plist...");
        break;
      case "ios:icons":
        try {
          console.log("Updating iOS icons...");
          await IosIconProcessor(config);
          console.log(`✅ iOS icons updated!\n`);
        } catch (error) {
          console.error("❌ Error updating iOS icons:", error, "\n");
        }
        break;
      case "ios:launchScreen":
        try {
          console.log("Updating launchScreen...");
          await IosLaunchScreenProcessor(config);
          console.log(`✅ LaunchScreen updated!\n`);
        } catch (error) {
          console.error("❌ Error updating launchScreen:", error, "\n");
        }
        break;
    }
  }
}

module.exports = {
  applyInstructions,
};
