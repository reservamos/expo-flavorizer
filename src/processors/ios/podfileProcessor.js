const fs = require("fs");
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

  let targetFlavors = config.flavors.map((flavor) => flavor.flavorName);
  // append the project name as the first target flavor
  targetFlavors.unshift(projectName);

  const input = fs.readFileSync(podfileFilePath, "utf8");

  // validate if the podfile has the target flavors
  const matcher = /abstract_target/m;
  if (matcher.test(input)) {
    throw new Error("AbstractTargetFound");
  }

  // trim podfile until the first target
  const targetBlocks = input.split("target '");
  const initialBlock = targetBlocks[0];

  // process the first target
  const firstTarget = "target '" + targetBlocks[1];
  let targetContent = firstTarget.replace(
    new RegExp(`target '${projectName}' do`, "m"),
    "abstract_target 'common' do"
  );

  // remove last end
  targetContent = targetContent.substring(0, targetContent.lastIndexOf("end"));

  // append the target flavors
  for (const targetFlavor of targetFlavors) {
    targetContent += `\n`;
    targetContent += `  target '${targetFlavor}' do\n  end\n`;
  }

  // append end to the first target
  targetContent += "end\n";

  // trim podfile starting from the second target found to the end of file
  let finalBlock = "";
  const targetBlocksLength = targetBlocks.length;

  if (targetBlocksLength > 2) {
    finalBlock = "\ntarget '" + targetBlocks.slice(2).join("target '");
  }

  const newPodfile = initialBlock + targetContent + finalBlock;
  return newPodfile;
}

module.exports = IosPodfileProcessor;
