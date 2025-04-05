const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { validateIosFolder } = require("./validateDependencies");

/**
 * Creates folder structure for each flavor
 * @param {Object} config Configuration object with flavors
 * @param {String} platform 'android', 'ios', or 'all'
 * @param {String} specificFlavor Optional specific flavor to create folders for
 */
function createFlavorFolders(config, { platform = "all", specificFlavor }) {
  if (!config.flavors || config.flavors.length === 0) {
    console.log(
      chalk.yellow(
        "⚠️ No flavors found in the config file. Skipping folder creation."
      )
    );
    return;
  }

  const flavors = specificFlavor
    ? config.flavors.filter((flavor) => flavor.name === specificFlavor)
    : config.flavors;

  if (flavors.length === 0) {
    console.log(
      chalk.yellow(`⚠️ Flavor "${specificFlavor}" not found in config file.`)
    );
    return;
  }

  console.log(chalk.cyan("\n📁 Creating folder structure for flavors...\n"));

  // Create Android flavor folders
  if (platform === "android" || platform === "all") {
    const androidBasePath = path.join(process.cwd(), "android/app/src");

    if (!fs.existsSync(androidBasePath)) {
      console.log(
        chalk.yellow(
          "⚠️ Android source path not found. Creating required folders..."
        )
      );
      fs.mkdirSync(androidBasePath, { recursive: true });
    }

    flavors.forEach((flavor) => {
      const flavorPath = path.join(androidBasePath, flavor.name);
      if (!fs.existsSync(flavorPath)) {
        fs.mkdirSync(flavorPath, { recursive: true });
        console.log(
          chalk.green(`✓ Created Android folder: ${chalk.white(flavorPath)}`)
        );
      } else {
        console.log(
          `ℹ️ Android folder already exists: ${chalk.white(flavorPath)}`
        );
      }
    });
  }

  // Create iOS flavor folders
  if (platform === "ios" || platform === "all") {
    const projectName = validateIosFolder();
    const iosBasePath = path.join(process.cwd(), "ios");

    flavors.forEach((flavor) => {
      const flavorPath = path.join(iosBasePath, flavor.name);
      if (!fs.existsSync(flavorPath)) {
        fs.mkdirSync(flavorPath, { recursive: true });
        console.log(
          chalk.green(`✓ Created iOS folder: ${chalk.white(flavorPath)}`)
        );
      } else {
        console.log(`ℹ️ iOS folder already exists: ${chalk.white(flavorPath)}`);
      }
    });
  }

  console.log("");
}

module.exports = createFlavorFolders;
