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
      const processCreateScheme = spawnSync(
        "ruby",
        [
          rubyScript,
          xcodeProjPath,
          //   xcconfigPath,
          flavorName,
          buildtarget,
          flavorBuildSettings.toString("base64"),
        ],
        { stdio: "inherit" }
      );
    }
  }
}

module.exports = IosXcConfigProcessor;
