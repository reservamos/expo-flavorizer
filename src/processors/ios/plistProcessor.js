const fs = require("fs");
const path = require("path");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosPlistProcessor(plistPath, config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  // Determine the source plist file path
  let sourcePlistFilePath = "";
  if (!plistPath) {
    sourcePlistFilePath = `${process.cwd()}/ios/${projectName}/Info.plist`;
  } else {
    sourcePlistFilePath = plistPath;
  }

  // Read the original plist content
  const originalPlistContent = fs.readFileSync(sourcePlistFilePath, "utf8");

  const results = [];

  // Process each flavor
  for (const flavor of config.flavors) {
    const flavorName = flavor.flavorName;

    // Create flavor directory if it doesn't exist
    const flavorDirPath = `${process.cwd()}/ios/Flavors/${flavorName}`;
    if (!fs.existsSync(flavorDirPath)) {
      fs.mkdirSync(flavorDirPath, { recursive: true });
    }

    // Clean up existing plist files to prevent duplication
    const oldPlistFilename = `Info-${flavorName}.plist`;
    const oldPlistPath = `${flavorDirPath}/${oldPlistFilename}`;

    if (fs.existsSync(oldPlistPath)) {
      fs.unlinkSync(oldPlistPath);
      console.log(`🧹 Removed old plist file: ${oldPlistFilename}`);
    }

    const newPlistFilename = `Info.plist`;
    const newPlistPath = `${flavorDirPath}/${newPlistFilename}`;

    if (fs.existsSync(newPlistPath)) {
      fs.unlinkSync(newPlistPath);
      console.log(`🧹 Removed existing plist file: ${newPlistFilename}`);
    }

    // Define the target plist path for this flavor
    const flavorPlistFilePath = `${flavorDirPath}/Info.plist`;

    // Start with the original content
    let flavorPlistContent = originalPlistContent;

    // Define the plist values specific to this flavor
    const plistValues = {
      CFBundleDisplayName: "$(DISPLAY_NAME)",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleName: "$(BUNDLE_NAME)",
      UILaunchStoryboardName: "$(SPLASH_SCREEN)",
      CFBundleShortVersionString: "$(MARKETING_VERSION)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
    };

    // Process the plist content with flavor-specific values
    for (const key in plistValues) {
      flavorPlistContent = replacePlistValue(
        flavorPlistContent,
        key,
        plistValues[key]
      );
    }

    // Write the flavor-specific plist file
    fs.writeFileSync(flavorPlistFilePath, flavorPlistContent);

    console.log(`✅ Created plist file for flavor ${flavorName}`);

    results.push({
      flavor: flavorName,
      plistPath: flavorPlistFilePath,
    });
  }

  return results;
}

function replacePlistValue(input, key, value) {
  // find the key
  const plistKey = input.match(new RegExp(`<key>${key}</key>`));
  if (!plistKey) {
    throw new Error(`${key}NotFound`);
  }

  // find the current value
  const plistValue = input.match(
    new RegExp(`<key>${key}</key>\\s*<string>(.*)</string>`)
  );

  if (!plistValue) {
    throw new Error(`${key}ValueNotFound`);
  }

  // replace the new value
  const newPlist = input.replace(
    plistValue[0],
    `<key>${key}</key>\n    <string>${value}</string>`
  );

  return newPlist;
}

module.exports = IosPlistProcessor;
