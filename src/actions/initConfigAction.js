const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");

const configTemplate = require("../utils/configTemplate");
const deleteConfigAction = require("./deleteConfigAction");

const CONFIG_FILE = require("../utils/constants").CONFIG_FILE;

function initConfigAction() {
  console.log(chalk.green("🚀 Initializing flavorizer configuration"));
  const configFilePath = `${process.cwd()}/${CONFIG_FILE}`;

  if (fs.existsSync(configFilePath)) {
    console.log(chalk.red("😅 Configuration file already exists"));
    promptDeleteAction(configFilePath);
    return;
  }

  fs.writeFileSync(configFilePath, JSON.stringify(configTemplate(), null, 2));

  console.log(chalk.green("😉 Configuration file created"));
}

async function promptDeleteAction(filePath) {
  const promptDelete = await inquirer.prompt([
    {
      type: "confirm",
      name: "delete",
      default: false,
      message: "🤔 Do you want to delete the configuration file?",
    },
  ]);

  if (promptDelete.delete === false) {
    return;
  }

  const promptConfirmation = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      default: false,
      message: "👀 Are you sure?",
    },
  ]);

  if (promptConfirmation.confirm === false) {
    return;
  }

  deleteConfigAction(filePath);
}

module.exports = initConfigAction;
