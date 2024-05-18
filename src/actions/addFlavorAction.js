const chalk = require("chalk");
const fs = require("fs");
const configLoader = require("../utils/configLoader");
const constants = require("../utils/constants");

function addFlavorAction() {
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  if (!config) {
    return;
  }

  console.log(chalk.green("✨ Adding a new flavor"));

  config.flavors.push({
    flavorName: "New flavor",
    flavorPath: "path/to/flavor",
  });

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

  console.log(chalk.green("🎉 Flavor added"));
}

module.exports = addFlavorAction;
