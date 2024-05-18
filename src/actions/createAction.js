const chalk = require("chalk");

function createAction() {
  console.log(chalk.green("Creating a new flavor"));
}

module.exports = createAction;
