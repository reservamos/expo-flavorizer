const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function AndroidAdaptiveIconProcessor(config) {
  const sizes = {
    "mipmap-mdpi": [48, 48],
    "mipmap-hdpi": [72, 72],
    "mipmap-xhdpi": [96, 96],
    "mipmap-xxhdpi": [144, 144],
    "mipmap-xxxhdpi": [192, 192],
  };

  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  config.flavors.forEach((flavor) => {
    const { flavorName, android } = flavor;
    const { adaptiveIcon } = android;

    if (adaptiveIcon) {
      const { background, foreground } = adaptiveIcon;

      if (!fs.existsSync(background)) {
        throw new Error(
          `Background icon file ${background} for ${flavorName} flavor does not exist`
        );
      }

      generateAdaptiveIcon(
        background,
        "ic_launcher_background",
        sizes,
        flavorName
      );

      if (!fs.existsSync(foreground)) {
        throw new Error(
          `Foreground icon file ${foreground} for ${flavorName} flavor does not exist`
        );
      }

      generateAdaptiveIcon(
        foreground,
        "ic_launcher_foreground",
        sizes,
        flavorName
      );

      generateAdaptiveIconXML(flavorName);
    }
  });
}

function generateAdaptiveIcon(iconPath, iconName, sizes, flavorName) {
  const iconBuffer = fs.readFileSync(iconPath);

  Object.keys(sizes).forEach((size) => {
    const [width, height] = sizes[size];
    const iconOutputPath = `${process.cwd()}/android/app/src/${flavorName}/res/${size}/${iconName}.png`;
    const icon = path.resolve(iconOutputPath);
    const iconExists = fs.existsSync(icon);

    if (iconExists) {
      fs.rmSync(icon);
    } else {
      fs.mkdirSync(path.dirname(icon), { recursive: true });
    }

    sharp(iconBuffer)
      .resize(width, height)
      .toFile(icon, (err) => {
        if (err) {
          throw err;
        }
      });
  });
}

function generateAdaptiveIconXML(flavorName) {
  const xmlFilePath = `${process.cwd()}/android/app/src/${flavorName}/res/mipmap-anydpi-v26/ic_launcher.xml`;
  const xml = path.resolve(xmlFilePath);
  const xmlExists = fs.existsSync(xml);

  if (xmlExists) {
    fs.rmSync(xml);
  } else {
    fs.mkdirSync(path.dirname(xml), { recursive: true });
  }

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  fs.writeFileSync(xml, xmlContent);
}

module.exports = AndroidAdaptiveIconProcessor;
