const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosSchemasProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  for (const flavor of config.flavors) {
    const { flavorName } = flavor;

    //  add the scheme to the xcode project
    const rubyScript = `${__dirname}/scripts/create_scheme.rb`;
    const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

    const processCreateScheme = spawnSync(
      "ruby",
      [rubyScript, xcodeProjPath, flavorName],
      { stdio: "inherit" }
    );
  }
}

module.exports = IosSchemasProcessor;
