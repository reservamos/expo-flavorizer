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

  // check if exists the expo-modules reference in the xcode project
  console.log("\n🧹 Cleaning outdated ExpoModulesProvider references...");
  const cleanExpoModulesScript = `${__dirname}/scripts/clean_expo_modules_refs.rb`;
  const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;

  const processCleanExpoModules = spawnSync(
    "ruby",
    [cleanExpoModulesScript, xcodeProjPath, projectName],
    { stdio: "inherit" }
  );

  // Fix any issues with the Xcode project before pod installation
  console.log("\n🛠️ Fixing Xcode project references...");
  const fixXcodeRefsScript = `${__dirname}/scripts/fix_xcode_references.rb`;

  const processFixXcodeRefs = spawnSync(
    "ruby",
    [fixXcodeRefsScript, xcodeProjPath],
    { stdio: "inherit" }
  );

  console.log("\n🔄 Checking CocoaPods version...");
  const podVersionResult = spawnSync("pod", ["--version"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });

  console.log("\n🚀 Updating pods project...\n");

  // Try multiple pod installation approaches
  // First try with the deintegrate/clean approach
  console.log("Attempting thorough pod installation approach...");
  const iosDirPath = path.join(process.cwd(), "ios");

  // Try to deintegrate first
  console.log("Deintegrating CocoaPods...");
  spawnSync("pod", ["deintegrate"], {
    stdio: "inherit",
    shell: true,
    cwd: iosDirPath,
  });

  // Clean derived data
  console.log("Cleaning Xcode derived data...");
  spawnSync("rm", ["-rf", "~/Library/Developer/Xcode/DerivedData"], {
    stdio: "inherit",
    shell: true,
  });

  // Install pods with verbose output
  console.log("Installing pods with verbose output...");
  const podInstallResult = spawnSync("pod", ["install", "--verbose"], {
    stdio: "inherit",
    shell: true,
    cwd: iosDirPath,
  });

  if (podInstallResult.status !== 0) {
    console.log(
      "\n⚠️ First pod install approach failed, trying alternative approach..."
    );

    // Try with repo update first
    console.log("Updating CocoaPods repos...");
    spawnSync("pod", ["repo", "update"], {
      stdio: "inherit",
      shell: true,
      cwd: iosDirPath,
    });

    // Try using --no-repo-update
    console.log("Trying pod install with --no-repo-update...");
    const secondAttempt = spawnSync("pod", ["install", "--no-repo-update"], {
      stdio: "inherit",
      shell: true,
      cwd: iosDirPath,
    });

    if (secondAttempt.status !== 0) {
      console.log("\n⚠️ Second approach failed, trying npx pod-install...");

      // Try the npx pod-install command
      const npxPodInstallResult = spawnSync("npx", ["pod-install"], {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
      });

      if (npxPodInstallResult.status !== 0) {
        console.warn("\n⚠️ All automated pod install attempts failed.");
        console.log("\n🔍 TROUBLESHOOTING INSTRUCTIONS:");
        console.log("1. Navigate to your iOS folder: cd ios");
        console.log("2. Remove CocoaPods artifacts: rm -rf Pods Podfile.lock");
        console.log("3. Try installing pods manually: pod install");
        console.log("4. If that fails, try: pod install --repo-update");
        console.log(
          "5. Check your Xcode version and CocoaPods version compatibility"
        );
        console.log("6. You may need to run: gem install cocoapods");
      }
    }
  }
}

module.exports = IosBuildTargetsProcessor;
