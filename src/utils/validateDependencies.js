const { spawn } = require("node:child_process");
const chalk = require("chalk");
const fs = require("fs");

function validateIosFolder() {
  // find <project>.xcodeproj folder for get project name
  const iosFolderExists = fs.existsSync(`${process.cwd()}/ios`);
  if (!iosFolderExists) {
    // throw new Error("IosFolderNotFoundException");
    console.log(
      chalk.red("IosFolderNotFoundException:"),
      "Please check if flavorizer is running on a valid react native project folder, if you using Expo, consider run the prebuild command:",
      chalk.green("npx expo prebuild"),
      "meanwhile we will create ios folder"
    );
    fs.mkdirSync(`${process.cwd()}/ios`);
  }

  let projectName = fs
    .readdirSync(`${process.cwd()}/ios`)
    .find((folder) => folder.match(/\.xcodeproj/g));

  if (!projectName) {
    // throw new Error("ProjectNameNotFoundException")
    console.log(
      chalk.yellow("ProjectNameNotFoundException:"),
      "your assets will be created in the default project folder (flavorizer)"
    );
    projectName = "flavorizer.xcodeproj";
  }

  projectName = projectName.replace(".xcodeproj", "");
  // console.log("Using project folder:", projectName);
  return projectName;
}

function validateXcodeProj() {
  const process = spawn("gem", ["list", "-i", "^xcodeproj$"]);

  process.stdout.on("data", (data) => {
    if (data.toString().length === "false") {
      throw new Error("XcodeProjGemNotFoundException");
    }
  });

  process.on("close", (code) => {
    if (code !== 0) {
      throw new Error("XcodeProjGemNotFoundException");
    }
  });
}

module.exports = {
  validateIosFolder,
  validateXcodeProj,
};
