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
    podfileFilePath = `${process.cwd()}/ios/${projectName}/Podfile`;
  } else {
    podfileFilePath = podfilePath;
  }

  const rubyScript = `${__dirname}/scripts/modify_podfile.rb`;
  const processModifyPodfile = spawnSync(
    "ruby",
    [rubyScript, podfileFilePath, projectName],
    { stdio: "inherit", shell: true }
  );

  return fs.readFileSync(podfileFilePath, "utf8");
}

module.exports = IosPodfileProcessor;
