const chalk = require("chalk");
const constants = require("../utils/constants");
const configLoader = require("../utils/configLoader");
const { applyInstructions } = require("../utils/instructions");
const createFlavorFolders = require("../utils/createFlavorFolders");

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
  let instructions = config.instructions || [];

  // Define all available instructions
  const allAvailableInstructions = [
    "android:androidManifest",
    "android:buildGradle",
    "android:icons",
    "android:splashScreen",
    "ios:icons",
    "ios:launchScreen",
    "ios:entitlements",
    "ios:plist",
    "ios:podfile",
    "ios:buildTargets",
  ];

  // If no instructions in config, use all available
  if (!config.instructions || config.instructions.length === 0) {
    console.log(
      chalk.yellow(
        "⚠️ No instructions found in the config file. Executing all available instructions.\n"
      )
    );

    instructions = allAvailableInstructions;
    config.instructions = instructions;
  }

  // If specific instructions were requested, make sure they get added to the instructions list
  if (specificInstructions) {
    const specificList = specificInstructions.split(",").map((i) => i.trim());

    // For each requested instruction, find matching available instructions and add them if not already present
    specificList.forEach((specInstr) => {
      // Handle both full instructions (platform:name) and partial instructions (name)
      const matchingInstructions = allAvailableInstructions.filter(
        (instruction) => {
          const [plat, processor] = instruction.split(":");
          return (
            instruction === specInstr ||
            processor === specInstr ||
            processor.includes(specInstr) ||
            (platform !== "all" && `${platform}:${specInstr}` === instruction)
          );
        }
      );

      // Add any matching instruction not already in the list
      matchingInstructions.forEach((matchInstr) => {
        if (!instructions.includes(matchInstr)) {
          // Filter by platform if specified
          if (platform === "all" || matchInstr.startsWith(platform + ":")) {
            instructions.push(matchInstr);
            console.log(
              chalk.green(
                `Adding instruction: ${matchInstr} based on request: ${specInstr}`
              )
            );
          }
        }
      });
    });

    // Update config with added instructions
    config.instructions = instructions;
  }

  // Create folder structure for flavors
  createFlavorFolders(config, { platform, specificFlavor });

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
        specificList.includes(`${plat}:${processor}`) ||
        specificList.some((specInstr) => processor.includes(specInstr))
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
