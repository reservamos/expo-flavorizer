const fs = require("fs");
const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosLaunchScreenProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  for (const flavor of config.flavors) {
    const { flavorName, ios } = flavor;
    const { launchScreen } = ios;

    if (launchScreen) {
      console.log("Creating LaunchScreen for flavor", flavorName);

      const flavorLaunchScreen = `${
        flavorName.charAt(0).toUpperCase() + flavorName.slice(1)
      }LaunchScreen.storyboard`;
      const flavorLaunchScreenPath = `${process.cwd()}/ios/${projectName}/${flavorLaunchScreen}`;

      //  create launch screen file from template
      fs.copyFileSync(
        `${__dirname}/assets/LaunchScreen.storyboard`,
        flavorLaunchScreenPath
      );

      //  process the launch screen file

      //  add the launch screen file to the xcode project
      const rubyScript = `${__dirname}/scripts/add_file.rb`;
      const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;
      const referencePath = `${projectName}/${flavorLaunchScreen}`;
      const processAddFile = spawnSync(
        "ruby",
        [
          rubyScript,
          xcodeProjPath,
          flavorLaunchScreenPath,
          projectName,
          referencePath,
        ],
        { stdio: "inherit" }
      );
    }
  }
}

module.exports = IosLaunchScreenProcessor;
