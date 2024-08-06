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
    const { flavorName, ios } = flavor;

    const flavorBuildSettings = flavor.buildSettings ?? {};

    const rubyScript = `${__dirname}/scripts/add_file.rb`;
    const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

    const buildtargets = ["Debug", "Release"];

    for (const buildtarget of buildtargets) {
      const flavorXcConfig = `${flavorName}${buildtarget}.xcconfig`;
      const flavorXcConfigPath = `${process.cwd()}/ios/${projectName}/${flavorXcConfig}`;
      const referencePath = `${projectName}/${flavorXcConfig}`;

      await generateXcConfigFile(
        buildtarget,
        projectName,
        flavor,
        flavorBuildSettings,
        flavorXcConfigPath
      );

      const processCreateScheme = spawnSync(
        "ruby",
        [
          rubyScript,
          xcodeProjPath,
          flavorXcConfigPath,
          projectName,
          referencePath,
        ],
        { stdio: "inherit" }
      );
    }
  }
}

async function generateXcConfigFile(
  buildTarget,
  projectName,
  flavor,
  buildSettings,
  flavorXcConfigPath
) {
  let buffer = [];

  buffer.push(
    `#include? "Pods/Target Support Files/Pods-${projectName}/Pods-${projectName}.${buildTarget.toLowerCase()}.xcconfig"`
  );
  buffer.push("");
  buffer.push(`ASSET_PREFIX=${flavor.flavorName}`);
  buffer.push(`BUNDLE_NAME=${flavor.flavorName}`);
  buffer.push(`BUNDLE_DISPLAY_NAME=${flavor.appName}`);
  buffer.push("");

  for (const [key, value] of Object.entries(buildSettings)) {
    buffer.push(`${key}=${value}`);
  }

  fs.writeFileSync(flavorXcConfigPath, buffer.join("\n"));
}

module.exports = IosXcConfigProcessor;
