const fs = require("fs");
const configLoader = require("../utils/configLoader");
const AndroidManifestProcessor = require("../processors/android/manifestProcessor");
const AndroidBuildGradleProcessor = require("../processors/android/buildGradleProcessor");
const AndroidClassicIconProcessor = require("../processors/android/classicIconProcessor");
const AndroidClassicRoundedIconProcessor = require("../processors/android/classicRoundedIconProcessor");
const AndroidAdaptiveIconProcessor = require("../processors/android/adaptiveIconProcessor");

async function applyInstructions(configFilePath) {
  const config = configLoader(configFilePath);
  for (const instruction of config.instructions) {
    // apply the instruction
    switch (instruction) {
      case "assets:download":
        // console.log("Downloading assets...");
        break;
      case "assets:extract":
        // console.log("Extracting assets...");
        break;
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
          const upadtedBuildGradle = await AndroidBuildGradleProcessor(
            buildGradle,
            config
          );
          fs.writeFileSync(
            `${process.cwd()}/android/app/build.gradle`,
            upadtedBuildGradle
          );
          console.log(`✅ build.gradle updated!\n`);
        } catch (error) {
          console.error("❌ Error updating build.gradle:", error, "\n");
        }
        break;
      case "android:dummyAssets":
        // console.log("Adding dummy assets...");
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
      case "reactnative:flavors":
        // console.log("Updating flavors...");
        break;
      case "reactnative:app":
        // console.log("Updating app...");
        break;
      case "reactnative:pages":
        // console.log("Updating pages...");
        break;
      case "reactnative:main":
        // console.log("Updating main...");
        break;
      case "reactnative:targets":
        // console.log("Updating targets...");
        break;
      case "ios:xcconfig":
        // console.log("Updating xcconfig...");
        break;
      case "ios:buildTargets":
        // console.log("Updating buildTargets...");
        break;
      case "ios:schema":
        // console.log("Updating schema...");
        break;
      case "ios:dummyAssets":
        // console.log("Adding dummy assets...");
        break;
      case "ios:icons":
        console.log("Updating iOS icons...");
        break;
      case "ios:plist":
        // console.log("Updating plist...");
        break;
      case "ios:launchScreen":
        // console.log("Updating launchScreen...");
        break;
      case "google:firebase":
        // console.log("Updating firebase...");
        break;
      case "assets:clean":
        // console.log("Cleaning assets...");
        break;
      case "ide:config":
        // console.log("Updating ide config...");
        break;
    }
  }
}

module.exports = {
  applyInstructions,
};
