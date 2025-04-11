const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const nunjucks = require("nunjucks");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");
const chalk = require("chalk");

async function IosLaunchScreenProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const launchScreenTemplatePath = path.join(
    __dirname,
    "assets",
    "LaunchScreen.storyboard"
  );

  if (!fs.existsSync(launchScreenTemplatePath)) {
    throw new Error(
      `Launch screen template not found at ${launchScreenTemplatePath}`
    );
  }

  const launchScreenTemplateContent = fs.readFileSync(
    launchScreenTemplatePath,
    {
      encoding: "utf-8",
    }
  );

  validateIosFolder();
  validateXcodeProj();

  for (const flavor of config.flavors) {
    const { flavorName, ios } = flavor;
    const { launchScreen } = ios;

    if (!launchScreen) {
      console.error(
        "No LaunchScreen configuration found for flavor",
        flavorName
      );
    }

    if (launchScreen) {
      const { image, backgroundColor, imageScale, imageWidth, imageHeight } =
        launchScreen;
      const flavorDirPath = `${process.cwd()}/ios/Flavors/${flavorName}`;
      const flavorLaunchScreenPath = `${flavorDirPath}/SplashScreen.storyboard`;

      // Create flavor directory if it doesn't exist
      if (!fs.existsSync(flavorDirPath)) {
        fs.mkdirSync(flavorDirPath, { recursive: true });
      }

      // Clean up old launch screen files
      const oldStoryboardPath = `${flavorDirPath}/SplashScreen-${flavorName}.storyboard`;
      if (fs.existsSync(oldStoryboardPath)) {
        fs.unlinkSync(oldStoryboardPath);
        console.log(
          `🧹 Removed old launch screen file: SplashScreen-${flavorName}.storyboard`
        );
      }

      // Clean up existing launch screen file to refresh it
      if (fs.existsSync(flavorLaunchScreenPath)) {
        fs.unlinkSync(flavorLaunchScreenPath);
        console.log(
          `🧹 Removed existing launch screen file to create a fresh one`
        );
      }

      // Make sure we clean up old image assets
      const oldAssetsPath = `${flavorDirPath}/Images-${flavorName}.xcassets`;
      if (fs.existsSync(oldAssetsPath)) {
        // Look for old launch image and background assets
        const oldLaunchImagePath = `${oldAssetsPath}/LaunchImage-${flavorName}.imageset`;
        const oldLaunchBackgroundPath = `${oldAssetsPath}/LaunchBackground-${flavorName}.imageset`;

        if (fs.existsSync(oldLaunchImagePath)) {
          deleteDirectory(oldLaunchImagePath);
          console.log(
            `🧹 Removed old launch image assets: LaunchImage-${flavorName}.imageset`
          );
        }

        if (fs.existsSync(oldLaunchBackgroundPath)) {
          deleteDirectory(oldLaunchBackgroundPath);
          console.log(
            `🧹 Removed old launch background assets: LaunchBackground-${flavorName}.imageset`
          );
        }
      }

      // Ensure new assets directory exists
      const newAssetsPath = `${flavorDirPath}/Images.xcassets`;
      if (!fs.existsSync(newAssetsPath)) {
        fs.mkdirSync(newAssetsPath, { recursive: true });
      }

      // Clean up existing assets with new naming format (for backwards compatibility)
      const oldLaunchImagePath = `${newAssetsPath}/LaunchImage.imageset`;
      const oldLaunchBackgroundPath = `${newAssetsPath}/LaunchBackground.imageset`;

      if (fs.existsSync(oldLaunchImagePath)) {
        deleteDirectory(oldLaunchImagePath);
        console.log(
          `🧹 Removed existing launch image assets to create fresh ones`
        );
      }

      if (fs.existsSync(oldLaunchBackgroundPath)) {
        deleteDirectory(oldLaunchBackgroundPath);
        console.log(
          `🧹 Removed existing launch background assets to create fresh ones`
        );
      }

      // Clean up new assets with Expo 52 naming format if they exist
      const splashScreenLogoPath = `${newAssetsPath}/SplashScreenLogo.imageset`;
      const splashScreenBackgroundPath = `${newAssetsPath}/SplashScreenBackground.colorset`;

      if (fs.existsSync(splashScreenLogoPath)) {
        deleteDirectory(splashScreenLogoPath);
        console.log(
          `🧹 Removed existing splash screen logo assets to create fresh ones`
        );
      }

      if (fs.existsSync(splashScreenBackgroundPath)) {
        deleteDirectory(splashScreenBackgroundPath);
        console.log(
          `🧹 Removed existing splash screen background assets to create fresh ones`
        );
      }

      // Parse the background color to get RGB values
      const alpha = "1.000";
      let red = "0xFF",
        green = "0xFF",
        blue = "0xFF";

      if (backgroundColor && backgroundColor.startsWith("#")) {
        const hexColor = backgroundColor.substring(1);
        if (hexColor.length === 6) {
          red = `0x${hexColor.substring(0, 2)}`;
          green = `0x${hexColor.substring(2, 4)}`;
          blue = `0x${hexColor.substring(4, 6)}`;
        }
      }

      // Generate background color and logo image
      await generateBackgroundColor(flavorName, alpha, red, green, blue);
      await generateLogo(
        flavorName,
        image,
        imageScale,
        imageWidth,
        imageHeight
      );

      //  create launch screen file from template
      fs.writeFileSync(flavorLaunchScreenPath, launchScreenTemplateContent);

      //  configurate the launch screen file template
      const launchScreenContent = fs.readFileSync(flavorLaunchScreenPath, {
        encoding: "utf-8",
      });

      nunjucks.configure({ autoescape: true });
      const launchScreenTemplate = nunjucks.renderString(launchScreenContent, {
        ALPHA: alpha,
        BLUE: blue,
        GREEN: green,
        RED: red,
      });

      //  write the launch screen file
      fs.writeFileSync(flavorLaunchScreenPath, launchScreenTemplate);

      console.log(`✅ Created launch screen file for flavor ${flavorName}`);
    }
  }
}

async function generateBackgroundColor(flavorName, alpha, red, green, blue) {
  // Create the colorset directory
  const colorsetPath = `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/SplashScreenBackground.colorset`;
  if (!fs.existsSync(colorsetPath)) {
    fs.mkdirSync(colorsetPath, { recursive: true });
  }

  // Generate colorset Contents.json
  const contentsJson = {
    colors: [
      {
        color: {
          "color-space": "srgb",
          components: {
            alpha: alpha,
            blue: blue.toString(16).toUpperCase().padStart(2, "0x"),
            green: green.toString(16).toUpperCase().padStart(2, "0x"),
            red: red.toString(16).toUpperCase().padStart(2, "0x"),
          },
        },
        idiom: "universal",
      },
    ],
    info: {
      author: "flavorizer",
      version: 1,
    },
  };

  fs.writeFileSync(
    `${colorsetPath}/Contents.json`,
    JSON.stringify(contentsJson, null, 2)
  );
}

async function generateLogo(
  flavorName,
  imagePath,
  imageScale,
  imageWidth,
  imageHeight
) {
  const imageBuffer = fs.readFileSync(imagePath);
  const imagesetPath = `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/SplashScreenLogo.imageset`;

  if (!fs.existsSync(imagesetPath)) {
    fs.mkdirSync(imagesetPath, { recursive: true });
  }

  // Set maximum dimensions to 200x200 as per Expo 52 requirements
  const maxWidth = 200;
  const maxHeight = 200;

  // Use provided dimensions or default to max values
  const targetWidth = Math.min(imageWidth ?? maxWidth, maxWidth);
  const targetHeight = Math.min(imageHeight ?? maxHeight, maxHeight);

  // Generate image at 1x scale (base image)
  await sharp(imageBuffer)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(`${imagesetPath}/logo.png`);

  // Generate image at 2x scale
  await sharp(imageBuffer)
    .resize({
      width: targetWidth * 2,
      height: targetHeight * 2,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(`${imagesetPath}/logo@2x.png`);

  // Generate image at 3x scale
  await sharp(imageBuffer)
    .resize({
      width: targetWidth * 3,
      height: targetHeight * 3,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(`${imagesetPath}/logo@3x.png`);

  // Generate Contents.json
  const contentsJson = {
    images: [
      {
        filename: "logo.png",
        idiom: "universal",
        scale: "1x",
      },
      {
        filename: "logo@2x.png",
        idiom: "universal",
        scale: "2x",
      },
      {
        filename: "logo@3x.png",
        idiom: "universal",
        scale: "3x",
      },
    ],
    info: {
      author: "flavorizer",
      version: 1,
    },
  };

  fs.writeFileSync(
    `${imagesetPath}/Contents.json`,
    JSON.stringify(contentsJson, null, 2)
  );
}

function deleteDirectory(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recurse
        deleteDirectory(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = IosLaunchScreenProcessor;
