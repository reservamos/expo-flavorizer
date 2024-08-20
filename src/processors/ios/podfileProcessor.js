const fs = require("fs");
const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosPodfileProcessor(podfilePath, config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  let podfileFilePath = "";
  if (!podfilePath) {
    podfileFilePath = `${process.cwd()}/ios/Podfile`;
  } else {
    podfileFilePath = podfilePath;
  }

  const target_flavors = config.flavors.map((flavor) => flavor.flavorName);

  const input = fs.readFileSync(podfileFilePath, "utf8");

  // trim podfile until the first target
  const targetBlocks = initialBlock.split("target");
  const initialBlock = targetBlocks[0];

  // trim podfile starting from the second target found to the end of file
  const finalBlock = targetBlocks.slice(1).join("target");

  const newPodfile = `${initialBlock}+${finalBlock}`;
  return newPodfile;
}

module.exports = IosPodfileProcessor;
