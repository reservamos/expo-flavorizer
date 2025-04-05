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

    for (const buildMode of buildModes) {
      const flavorXcConfig = `${buildMode}-${flavorName}.xcconfig`;
      const flavorXcConfigPath = `${process.cwd()}/ios/${flavorName}/${flavorXcConfig}`;

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

  buffer.push(
    `#include? "Pods/Target Support Files/Pods-common-${projectName}/Pods-common-${projectName}.${buildMode.toLowerCase()}.xcconfig"`
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
  buffer.push(`SPLASH_SCREEN=SplashScreen-${flavor.flavorName}.storyboard`);

  for (const [key, value] of Object.entries(buildSettings)) {
    buffer.push(`${key}=${value}`);
  }

  fs.writeFileSync(flavorXcConfigPath, buffer.join("\n"));
}

module.exports = IosXcConfigProcessor;
