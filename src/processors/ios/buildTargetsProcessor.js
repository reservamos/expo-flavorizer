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

    const rubyScript = `${__dirname}/scripts/add_targets.rb`;
    const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

    const buildSettingsString = JSON.stringify(flavorBuildSettings);
    const buildSettingsBase64 = new Buffer.from(buildSettingsString).toString(
      "base64"
    );

    const processCreateTargets = spawnSync(
      "ruby",
      [rubyScript, xcodeProjPath, projectName, flavorName, buildSettingsBase64],
      { stdio: "inherit" }
    );
  }
}

module.exports = IosBuildTargetsProcessor;
