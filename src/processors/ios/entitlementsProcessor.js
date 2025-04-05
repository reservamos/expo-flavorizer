const fs = require("fs");
const path = require("path");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosEntitlementsProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  // Path to the empty entitlements template
  const emptyEntitlementsPath = path.join(
    __dirname,
    "assets",
    "empty.entitlements"
  );

  if (!fs.existsSync(emptyEntitlementsPath)) {
    throw new Error(
      `Empty entitlements template not found at ${emptyEntitlementsPath}`
    );
  }

  // Read the empty entitlements template
  const emptyEntitlements = fs.readFileSync(emptyEntitlementsPath, "utf8");

  // Process each flavor
  for (const flavor of config.flavors) {
    const { flavorName } = flavor;

    // Create flavor directory if it doesn't exist
    const flavorDirPath = `${process.cwd()}/ios/${flavorName}`;
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
    }

    // Create Debug.entitlements
    const debugEntitlementsPath = path.join(
      flavorDirPath,
      "Debug.entitlements"
    );
    fs.writeFileSync(debugEntitlementsPath, emptyEntitlements);

    // Create Release.entitlements
    const releaseEntitlementsPath = path.join(
      flavorDirPath,
      "Release.entitlements"
    );
    fs.writeFileSync(releaseEntitlementsPath, emptyEntitlements);

    console.log(`✅ Created entitlements files for flavor ${flavorName}`);
  }
}

module.exports = IosEntitlementsProcessor;
