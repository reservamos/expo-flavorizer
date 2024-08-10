const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function AndroidAdaptiveIconProcessor(config) {
  const sizes = {
    "mipmap-mdpi": [108, 108],
    "mipmap-hdpi": [162, 162],
    "mipmap-xhdpi": [216, 216],
    "mipmap-xxhdpi": [324, 324],
    "mipmap-xxxhdpi": [432, 432],
  };

  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  config.flavors.forEach((flavor) => {
    const { flavorName, android } = flavor;
    const { adaptiveIcon } = android;

    if (adaptiveIcon) {
      const { background, foreground, foregroundScale } = adaptiveIcon;

      if (!fs.existsSync(background)) {
        throw new Error(
          `Background icon file ${background} for ${flavorName} flavor does not exist`
        );
      }

      // generate background icon with 100% of the size by default
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

      // generate foreground icon with 60% of the size by default
      generateAdaptiveIcon(
        foreground,
        "ic_launcher_foreground",
        sizes,
        flavorName,
        foregroundScale
      );

      // generate adaptive icon XML
      generateAdaptiveIconXML(flavorName, "ic_launcher");

      // generate adaptive icon round XML
      generateAdaptiveIconXML(flavorName, "ic_launcher_round");
    }
  });
}

function generateAdaptiveIcon(iconPath, iconName, sizes, flavorName, scale) {
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

    if (iconName === "ic_launcher_foreground") {
      // scale foreground icon to 60% of the size
      const prefferedScale = scale ?? 0.6;
      const scaledWidth = Math.round(width * prefferedScale);
      const scaledHeight = Math.round(height * prefferedScale);

      sharp(iconBuffer)
        .resize(scaledWidth, scaledHeight)
        .toBuffer()
        .then((buffer) => {
          sharp({
            create: {
              width: width,
              height: height,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            },
          })
            .composite([
              {
                input: buffer,
                gravity: "centre",
              },
            ])
            .toFile(icon, (err) => {
              if (err) {
                throw err;
              }
            });
        });
    } else {
      sharp(iconBuffer)
        .resize(width, height)
        .toFile(icon, (err) => {
          if (err) {
            throw err;
          }
        });
    }
  });
}

function generateAdaptiveIconXML(flavorName, iconXMLName) {
  const xmlFilePath = `${process.cwd()}/android/app/src/${flavorName}/res/mipmap-anydpi-v26/${iconXMLName}.xml`;
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
