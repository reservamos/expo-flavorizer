const fs = require("fs");
const chalk = require("chalk");

function deleteConfigAction(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red("Configuration file not found"));
    return;
  }

  fs.unlinkSync(filePath);

  console.log(chalk.green("🗑️ Configuration file deleted"));
}

module.exports = deleteConfigAction;
