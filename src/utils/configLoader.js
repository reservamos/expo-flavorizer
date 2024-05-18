const fs = require("fs");
const CONFIG_FILE = require("../utils/constants").CONFIG_FILE;

function configLoader() {
  const configFilePath = `${process.cwd()}/${CONFIG_FILE}`;

  if (!fs.existsSync(configFilePath)) {
    console.log("Configuration file not found");
    return;
  }

  return JSON.parse(fs.readFileSync(configFilePath));
}

module.exports = configLoader;
