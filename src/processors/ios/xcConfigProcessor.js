const fs = require("fs");
const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosXcConfigProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  for (const flavor of config.flavors) {
    const { flavorName } = flavor;

    const flavorBuildSettings = flavor.buildSettings ?? {};

    const buildModes = ["Debug", "Release"];

    // Create flavor directory if it doesn't exist
    const flavorDirPath = `${process.cwd()}/ios/Flavors/${flavorName}`;
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
    }

    // Clean up existing xcconfig files to prevent duplication
    for (const buildMode of buildModes) {
      const oldXcConfigFilename = `${buildMode}-${flavorName}.xcconfig`;
      const oldXcConfigPath = `${flavorDirPath}/${oldXcConfigFilename}`;

      if (fs.existsSync(oldXcConfigPath)) {
        fs.unlinkSync(oldXcConfigPath);
        console.log(`🧹 Removed old xcconfig file: ${oldXcConfigFilename}`);
      }

      const newXcConfigFilename = `${buildMode}.xcconfig`;
      const newXcConfigPath = `${flavorDirPath}/${newXcConfigFilename}`;

      if (fs.existsSync(newXcConfigPath)) {
        fs.unlinkSync(newXcConfigPath);
        console.log(
          `🧹 Removed existing xcconfig file: ${newXcConfigFilename}`
        );
      }
    }

    for (const buildMode of buildModes) {
      const flavorXcConfig = `${buildMode}.xcconfig`;
      const flavorXcConfigPath = `${process.cwd()}/ios/Flavors/${flavorName}/${flavorXcConfig}`;

      await generateXcConfigFile(
        buildMode,
        projectName,
        flavor,
        flavorBuildSettings,
        flavorXcConfigPath
      );

      console.log(
        `✅ Created xcconfig file for flavor ${flavorName} and build mode ${buildMode}`
      );
    }
  }
}

async function generateXcConfigFile(
  buildMode,
  projectName,
  flavor,
  buildSettings,
  flavorXcConfigPath
) {
  let buffer = [];
  const capitalizedFlavorName =
    flavor.flavorName.charAt(0).toUpperCase() + flavor.flavorName.slice(1);
  const buildModeLC = buildMode.toLowerCase();

  // Updated CocoaPods import line to match the expected format
  buffer.push(
    `#include? "Pods/Target Support Files/Pods-common-${flavor.flavorName}/Pods-common-${flavor.flavorName}.${buildModeLC}.xcconfig"`
  );
  buffer.push("");
  buffer.push(`BUNDLE_NAME=${flavor.flavorName}`);
  buffer.push(`DISPLAY_NAME=${flavor.appName}`);
  buffer.push(`PRODUCT_BUNDLE_IDENTIFIER=${flavor.ios.bundleId}`);
  buffer.push(`MARKETING_VERSION=${flavor.ios.versionString ?? "1.0"}`);
  const buildNumber =
    typeof flavor.ios.buildNumber === "number"
      ? flavor.ios.buildNumber
      : parseInt(flavor.ios.buildNumber, 10) || 1;
  buffer.push(`CURRENT_PROJECT_VERSION=${buildNumber}`);
  buffer.push(`SPLASH_SCREEN=SplashScreen.storyboard`);

  for (const [key, value] of Object.entries(buildSettings)) {
    buffer.push(`${key}=${value}`);
  }

  fs.writeFileSync(flavorXcConfigPath, buffer.join("\n"));
}

module.exports = IosXcConfigProcessor;
