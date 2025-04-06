const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
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

  // Create Flavors directory structure if it doesn't exist
  const flavorsDirPath = path.join(process.cwd(), "ios", "Flavors");
  if (!fs.existsSync(flavorsDirPath)) {
    fs.mkdirSync(flavorsDirPath, { recursive: true });
    console.log("✅ Created Flavors directory in iOS project");
  }

  for (const flavor of config.flavors) {
    const { flavorName, appName, ios } = flavor;
    const capitalizedFlavorName =
      flavor.flavorName.charAt(0).toUpperCase() + flavor.flavorName.slice(1);

    // Create directory for this flavor if it doesn't exist
    const flavorDirPath = path.join(flavorsDirPath, flavorName);
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
      console.log(`✅ Created directory for flavor: ${flavorName}`);
    }

    const flavorBuildSettings = {
      ...flavor.ios.buildSettings,
      ...config.app.ios.buildSettings,
    };

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

    console.log(`✅ Flavor target ${flavorName} added to Xcode project`);
  }

  console.log("\n🧹 Cleaning previous pods project...");
  const processCleanPods = spawnSync("rm", ["-rf", "Pods", "Podfile.lock"], {
    stdio: "inherit",
    shell: true,
    cwd: `${process.cwd()}/ios`,
  });

  console.log("\n🧹 Cleaning previous xcode project...");
  const processCleanXcodeBuild = spawnSync(
    "xattr -w com.apple.xcode.CreatedByBuildSystem true ./ios/build && cd ios && xcodebuild clean",
    [],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  console.log("\n🚀 Updating pods project...\n");
  const processUpdatePods = spawnSync("npx", ["pod-install"], {
    stdio: "inherit",
    shell: true,
  });

  console.log("\n🧹 Cleaning outdated ExpoModulesProvider references...");
  const cleanExpoModulesScript = `${__dirname}/scripts/clean_expo_modules_refs.rb`;
  const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

  const processCleanExpoModules = spawnSync(
    "ruby",
    [cleanExpoModulesScript, xcodeProjPath, projectName],
    { stdio: "inherit" }
  );

  // check if exists the expo-modules reference in the xcode project
}

module.exports = IosBuildTargetsProcessor;
