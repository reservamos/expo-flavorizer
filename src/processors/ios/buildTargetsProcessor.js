const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosBuildTargetsProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  for (const flavor of config.flavors) {
    const { flavorName, ios } = flavor;

    const flavorBuildSettings = flavor.buildSettings ?? {};

    const rubyScript = `${__dirname}/scripts/add_build_configuration.rb`;
    const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

    const buildtargets = ["Debug", "Release"];

    for (const buildtarget of buildtargets) {
      const flavorXcConfig = `${flavorName}${buildtarget}.xcconfig`;
      const flavorXcConfigPath = `${process.cwd()}/ios/${projectName}/${flavorXcConfig}`;
      const flavorXcConfigFileReference = `${projectName}/${flavorXcConfig}`;
      const buildSettingsString = JSON.stringify(flavorBuildSettings);
      const buildSettingsBase64 = new Buffer.from(buildSettingsString).toString(
        "base64"
      );

      const processCreateScheme = spawnSync(
        "ruby",
        [
          rubyScript,
          xcodeProjPath,
          flavorXcConfigFileReference,
          flavorName,
          buildtarget,
          buildSettingsBase64,
        ],
        { stdio: "inherit" }
      );
    }
  }
}

module.exports = IosBuildTargetsProcessor;
