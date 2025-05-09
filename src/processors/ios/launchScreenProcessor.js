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

      // Clean up existing assets with new naming format
      const newLaunchImagePath = `${newAssetsPath}/LaunchImage-${flavorName}.imageset`;
      const newLaunchBackgroundPath = `${newAssetsPath}/LaunchBackground-${flavorName}.imageset`;

      if (fs.existsSync(newLaunchImagePath)) {
        deleteDirectory(newLaunchImagePath);
        console.log(
          `🧹 Removed existing launch image assets to create fresh ones`
        );
      }

      if (fs.existsSync(newLaunchBackgroundPath)) {
        deleteDirectory(newLaunchBackgroundPath);
        console.log(
          `🧹 Removed existing launch background assets to create fresh ones`
        );
      }

      await generateBackgroundImage(flavorName, backgroundColor);

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
        IMAGE: `LaunchImage-${flavorName}`,
        IMAGE_WIDTH: imageWidth ?? 1024,
        IMAGE_HEIGHT: imageHeight ?? 1024,
        BACKGROUND: `LaunchBackground-${flavorName}`,
      });

      //  write the launch screen file
      fs.writeFileSync(flavorLaunchScreenPath, launchScreenTemplate);

      console.log(`✅ Created launch screen file for flavor ${flavorName}`);
    }
  }
}

async function generateBackgroundImage(flavorName, backgroundColor) {
  const imagesetPath = `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/LaunchBackground-${flavorName}.imageset/background.png`;
  const imageset = path.resolve(imagesetPath);
  const imagesetExists = fs.existsSync(imageset);

  if (imagesetExists) {
    fs.rmSync(imageset);
  } else {
    fs.mkdirSync(path.dirname(imageset), { recursive: true });
  }

  sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: backgroundColor,
    },
  }).toFile(imageset, (err) => {
    if (err) {
      throw err;
    }
  });

  //   generate Contents.json
  const contentsJson = {
    images: [
      {
        filename: "background.png",
        idiom: "universal",
      },
    ],
    info: {
      author: "xcode",
      version: 1,
    },
  };

  fs.writeFileSync(
    `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/LaunchBackground-${flavorName}.imageset/Contents.json`,
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
  const imagesetPath = `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/LaunchImage-${flavorName}.imageset/image.png`;
  const imageset = path.resolve(imagesetPath);
  const imagesetExists = fs.existsSync(imageset);

  if (imagesetExists) {
    fs.rmSync(imageset);
  } else {
    fs.mkdirSync(path.dirname(imageset), { recursive: true });
  }

  // resize image based on width, height and scale
  const prefferedScale = imageScale ?? 1.0;
  const prefferedImageWidth = imageWidth ?? 1024;
  const prefferedImageHeight = imageHeight ?? 1024;
  const scaledWidth = Math.round(prefferedImageWidth * prefferedScale);
  const scaledHeight = Math.round(prefferedImageHeight * prefferedScale);

  sharp({
    create: {
      width: scaledWidth,
      height: scaledHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: imageBuffer,
        gravity: "centre",
      },
    ])
    .toFile(imageset, (err) => {
      if (err) {
        throw err;
      }
    });

  //   generate Contents.json
  const contentsJson = {
    images: [
      {
        filename: "image.png",
        idiom: "universal",
      },
    ],
    info: {
      author: "xcode",
      version: 1,
    },
  };

  fs.writeFileSync(
    `${process.cwd()}/ios/Flavors/${flavorName}/Images.xcassets/LaunchImage-${flavorName}.imageset/Contents.json`,
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
