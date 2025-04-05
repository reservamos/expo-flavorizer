const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const nunjucks = require("nunjucks");
const { spawnSync } = require("child_process");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosLaunchScreenProcessor(config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
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
      console.log("Creating LaunchScreen for flavor", flavorName);
      const { image, backgroundColor, imageScale, imageWidth, imageHeight } =
        launchScreen;
      const flavorLaunchScreenPath = `${process.cwd()}/ios/${flavorName}/SplashScreen.storyboard`;

      await generateBackgroundImage(flavorName, backgroundColor);

      await generateLogo(
        flavorName,
        image,
        imageScale,
        imageWidth,
        imageHeight
      );

      //  create launch screen file from template
      fs.copyFileSync(
        path.join(__dirname, "assets", "LaunchScreen.storyboard"),
        flavorLaunchScreenPath
      );

      //  configurate the launch screen file template
      const launchScreenContent = fs.readFileSync(flavorLaunchScreenPath, {
        encoding: "utf-8",
      });

      nunjucks.configure({ autoescape: true });
      const launchScreenTemplate = nunjucks.renderString(launchScreenContent, {
        IMAGE: `LaunchImage`,
        IMAGE_WIDTH: imageWidth ?? 1024,
        IMAGE_HEIGHT: imageHeight ?? 1024,
        BACKGROUND: `LaunchBackground`,
      });

      //  write the launch screen file
      fs.writeFileSync(flavorLaunchScreenPath, launchScreenTemplate);

      //  add the launch screen file to the xcode project
      const rubyScript = path.join(__dirname, "scripts", "add_file.rb");
      const xcodeProjPath = path.join(
        process.cwd(),
        "ios",
        `${projectName}.xcodeproj`
      );
      const referencePath = path.join(flavorName, "SplashScreen.storyboard");
      const processAddFile = spawnSync(
        "ruby",
        [
          rubyScript,
          xcodeProjPath,
          flavorLaunchScreenPath,
          projectName,
          referencePath,
        ],
        { stdio: "inherit" }
      );
    }
  }
}

async function generateBackgroundImage(flavorName, backgroundColor) {
  const imagesetPath = `${process.cwd()}/ios/${flavorName}/Images.xcassets/LaunchBackground.imageset/background.png`;
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
    `${process.cwd()}/ios/${flavorName}/Images.xcassets/LaunchBackground.imageset/Contents.json`,
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
  const imagesetPath = `${process.cwd()}/ios/${flavorName}/Images.xcassets/LaunchImage.imageset/image.png`;
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
    `${process.cwd()}/ios/${flavorName}/Images.xcassets/LaunchImage.imageset/Contents.json`,
    JSON.stringify(contentsJson, null, 2)
  );
}

module.exports = IosLaunchScreenProcessor;
