const chalk = require("chalk");
const constants = require("../utils/constants");
const configLoader = require("../utils/configLoader");
const { applyInstructions } = require("../utils/instructions");

async function applyAction(options) {
  const configFilePath = `${process.cwd()}/${constants.CONFIG_FILE}`;
  const config = configLoader(configFilePath);

  // Extract options
  const {
    platform = "all",
    instructions: specificInstructions,
    flavor: specificFlavor,
  } = options || {};

  // validate the instructions into the config file
  let instructions = config.instructions;
  if (!instructions) {
    console.log(
      chalk.yellow(
        "⚠️ No instructions found in the config file. Executing all available instructions.\n"
      )
    );

    // Set all available instructions as default
    instructions = [
      "android:androidManifest",
      "android:buildGradle",
      "android:icons",
      "android:splashScreen",
      "ios:icons",
      "ios:launchScreen",
      "ios:podfile",
      "ios:buildTargets",
      "ios:plist",
    ];

    // Update the config with all instructions
    config.instructions = instructions;
  }

  console.log(
    `\nApplying the flavors to the project with next instructions${
      platform !== "all" ? ` (for ${platform})` : ""
    }${specificFlavor ? ` (flavor: ${specificFlavor})` : ""}:\n`
  );

  // Filter instructions by platform for display purposes
  let displayInstructions = instructions;

  if (platform !== "all") {
    displayInstructions = instructions.filter((instruction) =>
      instruction.startsWith(platform + ":")
    );
  }

  // Filter further by specific instructions if provided
  if (specificInstructions) {
    const specificList = specificInstructions.split(",").map((i) => i.trim());
    displayInstructions = displayInstructions.filter((instruction) => {
      const [plat, processor] = instruction.split(":");
      return (
        specificList.includes(instruction) ||
        specificList.includes(processor) ||
        specificList.includes(`${plat}:${processor}`)
      );
    });
  }

  // iterate for each instruction that will be applied
  displayInstructions.forEach((instruction) => {
    console.log(`🔹 ${chalk.yellow(instruction)}`);
  });

  console.log("\n");

  // apply the instructions for each flavor with the provided options
  await applyInstructions(configFilePath, {
    platform,
    instructions: specificInstructions,
    flavor: specificFlavor,
  });
}

module.exports = applyAction;
