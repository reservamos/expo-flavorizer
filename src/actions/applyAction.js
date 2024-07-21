const chalk = require("chalk");
const constants = require("../utils/constants");
const configLoader = require("../utils/configLoader");
const { applyInstructions } = require("../utils/instructions");

async function applyAction() {
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  console.log(
    "\nApplying the flavors to the project with next instructions:\n"
  );

  // validate the instructions into the config file
  const instructions = config.instructions;
  if (!instructions) {
    console.log(chalk.red("❌ No instructions found in the config file.\n"));
    return;
  }

  // iterate for each instruction
  instructions.forEach((instruction) => {
    console.log(`🔹 ${chalk.yellow(instruction)}`);
  });

  console.log("\n");

  // apply the instructions for each flavor
  await applyInstructions(configFilePath);
}

module.exports = applyAction;
