const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { platform } = require("os");

async function IosIconProcessor(config) {
  const sizes = {
    "Icon-App-20x20@2x.png": [40, 40],
    "Icon-App-20x20@3x.png": [60, 60],
    "Icon-App-29x29@2x.png": [58, 58],
    "Icon-App-29x29@3x.png": [87, 87],
    "Icon-App-38x38@2x.png": [76, 76],
    "Icon-App-38x38@3x.png": [114, 114],
    "Icon-App-40x40@2x.png": [80, 80],
    "Icon-App-40x40@3x.png": [120, 120],
    "Icon-App-60x60@2x.png": [120, 120],
    "Icon-App-60x60@3x.png": [180, 180],
    "Icon-App-64x64@2x.png": [128, 128],
    "Icon-App-64x64@3x.png": [192, 192],
    "Icon-App-68x68@2x.png": [136, 136],
    "Icon-App-76x76@2x.png": [152, 152],
    "Icon-App-83.5x83.5@2x.png": [167, 167],
    "Icon-App-1024x1024@1x.png": [1024, 1024],
  };

  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  config.flavors.forEach((flavor) => {
    const { flavorName, defaultIcon, ios } = flavor;

    if (!fs.existsSync(defaultIcon)) {
      throw new Error(
        `Icon file ${defaultIcon} for ${flavorName} flavor does not exist`
      );
    }

    // find <project>.xcodeproj folder for get project name

    const iosFolderExists = fs.existsSync(`${process.cwd()}/ios`);
    if (!iosFolderExists) {
      // throw new Error("IosFolderNotFoundException");
      return;
    }

    let projectName = fs
      .readdirSync(`${process.cwd()}/ios`)
      .find((folder) => folder.match(/\.xcodeproj/g));
    projectName = projectName.replace(".xcodeproj", "");

    if (!projectName) {
      throw new Error("ProjectNameNotFoundException");
    }

    const iconBuffer = fs.readFileSync(defaultIcon);
    const contentsJson = {
      images: [],
      info: {
        author: "react-native-flavorizer",
        version: 1,
      },
    };

    const iOSAppPath = `${process.cwd()}/ios/${projectName}/Images.xcassets/${
      flavorName.charAt(0).toUpperCase() + flavorName.slice(1)
    }AppIcon.appiconset`;

    Object.keys(sizes).forEach((size) => {
      const [width, height] = sizes[size];

      const iconPath = `${iOSAppPath}/${size}`;
      const icon = path.resolve(iconPath);
      const iconExists = fs.existsSync(icon);

      if (iconExists) {
        fs.rmSync(icon);
      } else {
        fs.mkdirSync(path.dirname(icon), { recursive: true });
      }

      const scaleString = size.match(/@(\d)x/g)[0].replace("@", "");
      const sizeString = size
        .match(/App-(.*)@/g)[0]
        .replace("App-", "")
        .replace("@", "");

      contentsJson.images.push({
        filename: size,
        idiom: "universal",
        platform: "ios",
        scale: scaleString,
        size: sizeString,
      });

      sharp(iconBuffer)
        .resize(width, height)
        .toFile(icon, (err) => {
          if (err) {
            throw err;
          }
        });
    });

    fs.writeFileSync(
      `${iOSAppPath}/Contents.json`,
      JSON.stringify(contentsJson, null, 2)
    );
  });
}

module.exports = IosIconProcessor;
