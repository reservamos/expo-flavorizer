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

async function applyInstructions(configFilePath, options = {}) {
  const { platform = "all", instructions: specificInstructions } = options;
  const config = configLoader(configFilePath);

  // Filter instructions based on platform and specific instructions if provided
  let instructionsToRun = config.instructions;

  // Filter by platform
  if (platform !== "all") {
    instructionsToRun = instructionsToRun.filter((instruction) =>
      instruction.startsWith(platform + ":")
    );
  }

  // Filter by specific instructions if provided
  if (specificInstructions) {
    const specificInstructionsList = specificInstructions
      .split(",")
      .map((i) => i.trim());
    instructionsToRun = instructionsToRun.filter((instruction) => {
      // Check if the full instruction is in the list or if just the processor part is in the list
      const [platform, processor] = instruction.split(":");
      return (
        specificInstructionsList.includes(instruction) ||
        specificInstructionsList.includes(processor) ||
        specificInstructionsList.includes(`${platform}:${processor}`)
      );
    });
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

module.exports = {
  applyInstructions,
};
