const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");
const constants = require("../utils/constants");
const configLoader = require("../utils/configLoader");

async function removeFlavorAction() {
  console.log(chalk.green("🚀 Removing a flavor"));
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  if (!config) {
    return;
  }

  const existingFlavors = config.flavors.map((flavor) => flavor.flavorName);
  const promptRemove = {
    type: "list",
    name: "flavorName",
    message: "🤔 Which flavor do you want to remove?",
    choices: existingFlavors,
  };

  await inquirer.prompt(promptRemove).then((answers) => {
    const flavorIndex = config.flavors.findIndex(
      (flavor) => flavor.flavorName === answers.flavorName
    );

    config.flavors.splice(flavorIndex, 1);

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  });

  console.log(chalk.green("🎉 Flavor removed"));
}

module.exports = removeFlavorAction;
