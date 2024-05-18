const chalk = require("chalk");

function listAction() {
  console.log(chalk.green("Listing all flavors"));
}

module.exports = listAction;
