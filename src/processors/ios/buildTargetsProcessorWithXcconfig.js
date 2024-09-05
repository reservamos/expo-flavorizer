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

    const flavorXcConfig = `${flavorName}.xcconfig`;
    const flavorXcConfigFileReference = `${projectName}/${flavorXcConfig}`;

    const buildSettingsString = JSON.stringify(flavorBuildSettings);
    const buildSettingsBase64 = new Buffer.from(buildSettingsString).toString(
      "base64"
    );

    const processCreateTargets = spawnSync(
      "ruby",
      [
        rubyScript,
        xcodeProjPath,
        flavorXcConfigFileReference,
        projectName,
        flavorName,
        buildSettingsBase64,
      ],
      { stdio: "inherit" }
    );

    console.log(`✅ Flavor ${flavorName} added to Xcode project`);
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
}

module.exports = IosBuildTargetsProcessor;
