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
const IosPodfileProcessor = require("../processors/ios/podfileProcessor");
const IosBuildTargetsProcessor = require("../processors/ios/buildTargetsProcessor");
const IosPlistProcessor = require("../processors/ios/plistProcessor");
const IosEntitlementsProcessor = require("../processors/ios/entitlementsProcessor");
const IosXcconfigProcessor = require("../processors/ios/xcConfigProcessor");
const IosXcPrivacyInfoProcessor = require("../processors/ios/xcPrivacyInfoProcessor");

async function applyInstructions(configFilePath, options = {}) {
  const {
    platform = "all",
    instructions: instructionsToRun,
    flavor: specificFlavor,
  } = options;
  let config = configLoader(configFilePath);

  // Handle flavor filtering
  if (specificFlavor) {
    console.log(`Filtering for specific flavor: ${specificFlavor}`);
    console.log("\n");
    const filteredFlavors = config.flavors.filter(
      (flavor) => flavor.flavorName === specificFlavor
    );

    if (filteredFlavors.length === 0) {
      console.error(
        `❌ Error: Flavor "${specificFlavor}" not found in configuration`
      );
      console.log("\n");
      return;
    }

    // Create a new config object with only the specified flavor
    config = {
      ...config,
      flavors: filteredFlavors,
    };
  } else {
    // When no specific flavor is set, use all flavors (default behavior)
    console.log(`Applying to all ${config.flavors.length} flavors`);
    console.log("\n");
  }

  for (const instruction of instructionsToRun) {
    switch (instruction) {
      case "android:androidManifest":
        await handleAndroidManifest(config);
        break;
      case "android:buildGradle":
        await handleBuildGradle(config);
        break;
      case "android:icons":
        await handleAndroidIcons(config);
        break;
      case "android:splashScreen":
        await handleAndroidSplashScreen(config);
        break;
      case "ios:podfile":
        await handleIosPodfile(config);
        break;
      case "ios:buildTargets":
        await handleIosBuildTargets(config);
        break;
      case "ios:plist":
        await handleIosPlist(config);
        break;
      case "ios:icons":
        await handleIosIcons(config);
        break;
      case "ios:launchScreen":
        await handleIosLaunchScreen(config);
        break;
      case "ios:entitlements":
        await handleIosEntitlements(config);
        break;
      case "ios:xcconfig":
        await handleIosXcconfig(config);
        break;
      case "ios:xcprivacyinfo":
        await handleIosXcPrivacyInfo(config);
        break;
    }
  }
}

async function handleAndroidManifest(config) {
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
}

async function handleBuildGradle(config) {
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
}

async function handleAndroidIcons(config) {
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
}

async function handleAndroidSplashScreen(config) {
  try {
    console.log("Updating android splash screen...");
    await AndroidSplashScreenProcessor(config);
    console.log(`✅ Android splash screen updated!\n`);
  } catch (error) {
    console.error("❌ Error updating splash screen:", error, "\n");
  }
}

async function handleIosPodfile(config) {
  try {
    console.log("Updating podfile...");
    const updatedPodfile = await IosPodfileProcessor(null, config);
    fs.writeFileSync(`${process.cwd()}/ios/Podfile`, updatedPodfile);
    console.log(`✅ Podfile updated!\n`);
  } catch (error) {
    console.error("❌ Error updating podfile:", error, "\n");
  }
}

async function handleIosBuildTargets(config) {
  try {
    console.log("Updating buildTargets...");
    await IosBuildTargetsProcessor(config);
    console.log(`✅ BuildTargets updated!\n`);
  } catch (error) {
    console.error("❌ Error updating buildTargets:", error, "\n");
  }
}

async function handleIosPlist(config) {
  try {
    console.log("Updating plist...");
    await IosPlistProcessor(null, config);
    console.log(`✅ Plist updated!\n`);
  } catch (error) {
    console.error("❌ Error updating plist:", error, "\n");
  }
}

async function handleIosIcons(config) {
  try {
    console.log("Updating iOS icons...");
    await IosIconProcessor(config);
    console.log(`✅ iOS icons updated!\n`);
  } catch (error) {
    console.error("❌ Error updating iOS icons:", error, "\n");
  }
}

async function handleIosLaunchScreen(config) {
  try {
    console.log("Updating launchScreen...");
    await IosLaunchScreenProcessor(config);
    console.log(`✅ LaunchScreen updated!\n`);
  } catch (error) {
    console.error("❌ Error updating launchScreen:", error, "\n");
  }
}

async function handleIosEntitlements(config) {
  try {
    console.log("Updating entitlements...");
    await IosEntitlementsProcessor(config);
    console.log(`✅ Entitlements updated!\n`);
  } catch (error) {
    console.error("❌ Error updating entitlements:", error, "\n");
  }
}

async function handleIosXcconfig(config) {
  try {
    console.log("Updating xcconfig files...");
    await IosXcconfigProcessor(config);
    console.log(`✅ Xcconfig files updated!\n`);
  } catch (error) {
    console.error("❌ Error updating xcconfig files:", error, "\n");
  }
}

async function handleIosXcPrivacyInfo(config) {
  try {
    console.log("Updating XC Privacy Info files...");
    await IosXcPrivacyInfoProcessor(config);
    console.log(`✅ XC Privacy Info files updated!\n`);
  } catch (error) {
    console.error("❌ Error updating XC Privacy Info files:", error, "\n");
  }
}

module.exports = {
  applyInstructions,
};
