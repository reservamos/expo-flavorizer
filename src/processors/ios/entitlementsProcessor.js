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

  const buildModes = ["Debug", "Release"];

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

  // Process each flavor
  for (const flavor of config.flavors) {
    const { flavorName } = flavor;

    // Create flavor directory if it doesn't exist
    const flavorDirPath = `${process.cwd()}/ios/${flavorName}`;
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
    }

    for (const buildMode of buildModes) {
      // Generate entitlements filename using build mode
      const entitlementsFile = `${buildMode}-${flavorName}.entitlements`;
      const entitlementsPath = `${process.cwd()}/ios/${flavorName}/${entitlementsFile}`;

      // Generate entitlements file for this flavor and build mode
      await generateEntitlementsFile(buildMode, flavor, entitlementsPath);

      console.log(
        `✅ Created entitlements file for flavor ${flavorName} and build mode ${buildMode}`
      );
    }
  }
}

async function generateEntitlementsFile(buildMode, flavor, entitlementsPath) {
  // Generate entitlements content based on flavor and build mode
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

  // You might want different entitlements for different build modes
  // For example, you might want more capabilities in Debug mode

  fs.writeFileSync(entitlementsPath, emptyEntitlements);
}

module.exports = IosEntitlementsProcessor;
