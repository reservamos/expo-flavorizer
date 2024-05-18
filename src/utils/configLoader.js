const chalk = require("chalk");
const fs = require("fs");
const constants = require("./constants");

function configLoader(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red("Configuration file not found"));
    return;
  }

  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = configLoader;
