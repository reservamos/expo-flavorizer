const fs = require("fs");
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

  let plistFilePath = "";
  if (!plistPath) {
    plistFilePath = `${process.cwd()}/ios/${projectName}/Info.plist`;
  } else {
    plistFilePath = plistPath;
  }

  let input = fs.readFileSync(plistFilePath, "utf8");

  const plistValues = {
    CFBundleDisplayName: "$(BUNDLE_DISPLAY_NAME)",
    CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
    CFBundleName: "$(PRODUCT_NAME)",
  };

  for (const key in plistValues) {
    input = replacePlistValue(input, key, plistValues[key]);
  }

  return input;
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
