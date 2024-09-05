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

      const capitalizedFlavorName =
        flavorName.charAt(0).toUpperCase() + flavorName.slice(1);
      const flavorLaunchScreen = `SplashScreen${capitalizedFlavorName}.storyboard`;
      const flavorLaunchScreenPath = `${process.cwd()}/ios/${projectName}/${flavorLaunchScreen}`;

      await generateBackgroundImage(
        capitalizedFlavorName,
        projectName,
        launchScreen.backgroundColor
      );

      await generateLogo(
        capitalizedFlavorName,
        projectName,
        launchScreen.image
      );

      //  create launch screen file from template
      fs.copyFileSync(
        `${__dirname}/assets/LaunchScreen.storyboard`,
        flavorLaunchScreenPath
      );

      //  configurate the launch screen file template
      const launchScreenContent = fs.readFileSync(flavorLaunchScreenPath, {
        encoding: "utf-8",
      });

      nunjucks.configure({ autoescape: true });
      const launchScreenTemplate = nunjucks.renderString(launchScreenContent, {
        IMAGE: `${capitalizedFlavorName}LaunchImage`,
        BACKGROUND: `${capitalizedFlavorName}LaunchBackground`,
      });

      fs.writeFileSync(flavorLaunchScreenPath, launchScreenTemplate);

      //  add the launch screen file to the xcode project
      const rubyScript = `${__dirname}/scripts/add_file.rb`;
      const xcodeProjPath = `${process.cwd()}/ios/${projectName}.xcodeproj`;
      const referencePath = `${projectName}/${flavorLaunchScreen}`;
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

async function generateBackgroundImage(
  flavorName,
  projectName,
  backgroundColor
) {
  const imagesetPath = `${process.cwd()}/ios/${projectName}/Images.xcassets/${flavorName}LaunchBackground.imageset/background.png`;
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
    `${process.cwd()}/ios/${projectName}/Images.xcassets/${flavorName}LaunchBackground.imageset/Contents.json`,
    JSON.stringify(contentsJson, null, 2)
  );
}

async function generateLogo(flavorName, projectName, imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const imagesetPath = `${process.cwd()}/ios/${projectName}/Images.xcassets/${flavorName}LaunchImage.imageset/image.png`;
  const imageset = path.resolve(imagesetPath);
  const imagesetExists = fs.existsSync(imageset);

  if (imagesetExists) {
    fs.rmSync(imageset);
  } else {
    fs.mkdirSync(path.dirname(imageset), { recursive: true });
  }

  sharp({
    create: {
      width: 3840,
      height: 1080,
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
    `${process.cwd()}/ios/${projectName}/Images.xcassets/${flavorName}LaunchImage.imageset/Contents.json`,
    JSON.stringify(contentsJson, null, 2)
  );
}

module.exports = IosLaunchScreenProcessor;
