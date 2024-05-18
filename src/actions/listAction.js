const chalk = require("chalk");
const constants = require("../utils/constants");
const configLoader = require("../utils/configLoader");

async function listAction() {
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  console.log(chalk.green("📜 Listing flavors"));
  config.flavors.forEach((flavor, index) => {
    console.log(chalk.white(`${index + 1}. ${flavor.flavorName}`));
  });
}

module.exports = listAction;
