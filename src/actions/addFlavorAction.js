const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");
const configLoader = require("../utils/configLoader");
const constants = require("../utils/constants");

async function addFlavorAction() {
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  if (!config) {
    return;
  }

  console.log(chalk.green("✨ Adding a new flavor"));

  const newFlavor = {};

  // Prompt for flavor name
  const promptFlavorName = await inquirer.prompt([
    {
      type: "input",
      name: "flavorName",
      message: "🤔 What is the flavor name?",
    },
  ]);

  if (
    config.flavors.find(
      (flavor) => flavor.flavorName === promptFlavorName.flavorName
    )
  ) {
    console.log(chalk.red("❌ Flavor already exists"));
    return;
  }

  newFlavor.flavorName = promptFlavorName.flavorName;

  // Prompt for app name and flavor platform
  const promptMainInfo = await inquirer.prompt([
    {
      type: "input",
      name: "appName",
      message: "🤔 What is the app name?",
    },
    {
      type: "input",
      name: "defaultIcon",
      message: "🤔 What is the default icon path?",
    },
    {
      type: "list",
      name: "flavorType",
      message: "🤔 What is the flavor platform?",
      choices: ["android", "ios", "both"],
    },
  ]);

  newFlavor.appName = promptMainInfo.appName;
  newFlavor.defaultIcon = promptMainInfo.defaultIcon;

  // Prompt for android specific information
  if (
    promptMainInfo.flavorType === "android" ||
    promptMainInfo.flavorType === "both"
  ) {
    newFlavor.android = {};
    const promptAndroidInfo = await inquirer.prompt([
      {
        type: "input",
        name: "applicationId",
        default: "com.example.app",
        message: "🤔 What is the android applicationId?",
      },
    ]);

    newFlavor.android.applicationId = promptAndroidInfo.applicationId;
  }

  // Prompt for iOS specific information
  if (
    promptMainInfo.flavorType === "ios" ||
    promptMainInfo.flavorType === "both"
  ) {
    newFlavor.ios = {};
    const promptIosInfo = await inquirer.prompt([
      {
        type: "input",
        name: "bundleId",
        default: "com.example.app",
        message: "🤔 What is the iOS bundle ID?",
      },
    ]);

    newFlavor.ios.bundleId = promptIosInfo.bundleId;
  }

  config.flavors.push(newFlavor);

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

  console.log(chalk.green("🎉 Flavor added"));
}

module.exports = addFlavorAction;
