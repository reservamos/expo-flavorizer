const fs = require("fs");
const path = require("path");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosXcPrivacyInfoProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  // Source privacy info file path
  const sourcePrivacyInfoPath = `${process.cwd()}/ios/${projectName}/PrivacyInfo.xcprivacy`;

  // Check if source file exists
  if (!fs.existsSync(sourcePrivacyInfoPath)) {
    console.warn(
      `⚠️ No PrivacyInfo.xcprivacy file found at ${sourcePrivacyInfoPath}. Skipping privacy info processing.`
    );
    return;
  }

  // Read the original privacy info content
  const originalPrivacyInfoContent = fs.readFileSync(
    sourcePrivacyInfoPath,
    "utf8"
  );

  // Process each flavor
  for (const flavor of config.flavors) {
    const flavorName = flavor.flavorName;

    // Create flavor directory if it doesn't exist
    const flavorDirPath = `${process.cwd()}/ios/${flavorName}`;
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
    }

    // Define the target privacy info path for this flavor
    const flavorPrivacyInfoPath = `${flavorDirPath}/PrivacyInfo-${flavorName}.xcprivacy`;

    // Copy the privacy info file
    fs.writeFileSync(flavorPrivacyInfoPath, originalPrivacyInfoContent);

    console.log(`✅ Created privacy info file for flavor ${flavorName}`);
  }
}

module.exports = IosXcPrivacyInfoProcessor;
