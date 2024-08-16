const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

async function AndroidSplashScreenProcessor(config) {
  const size = [1284, 2778];
  const densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];

  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  for (const flavor of config.flavors) {
    const { flavorName, android } = flavor;
    const { splash } = android;

    if (splash) {
      const {
        image,
        resizeMode,
        backgroundColor,
        imageScale,
        imageWidth,
        imageHeight,
      } = splash;

      if (!fs.existsSync(image)) {
        throw new Error(
          `Image file ${image} for ${flavorName} flavor does not exist`
        );
      }

      // generate splashscreen images
      for (const density of densities) {
        await generateSplashScreenImage(
          image,
          size,
          flavorName,
          density,
          imageScale,
          imageWidth,
          imageHeight
        );
      }

      // generate colors.xml
      await generateColorsXML(flavorName, backgroundColor);

      // generate splashscreen.xml
      await generateSplashScreenXML(flavorName);
    }
  }
}

async function generateSplashScreenImage(
  imagePath,
  size,
  flavorName,
  density,
  imageScale,
  imageWidth,
  imageHeight
) {
  const imageBuffer = fs.readFileSync(imagePath);

  const [width, height] = size;
  const imageOutputPath = `${process.cwd()}/android/app/src/${flavorName}/res/drawable-${density}/splashscreen_image.png`;
  const image = path.resolve(imageOutputPath);
  const imageExists = fs.existsSync(image);

  if (imageExists) {
    fs.rmSync(image);
  } else {
    fs.mkdirSync(path.dirname(image), { recursive: true });
  }

  // resize image based on width, height and scale
  const prefferedScale = imageScale ?? 1.0;
  const prefferedImageWidth = imageWidth ?? 1024;
  const prefferedImageHeight = imageHeight ?? 1024;
  const scaledWidth = Math.round(prefferedImageWidth * prefferedScale);
  const scaledHeight = Math.round(prefferedImageHeight * prefferedScale);

  sharp(imageBuffer)
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
        .toFile(image, (err) => {
          if (err) {
            throw err;
          }
        });
    });
}

async function generateColorsXML(flavorName, backgroundColor) {
  const colorsFilePath = `${process.cwd()}/android/app/src/${flavorName}/res/values/colors.xml`;
  const colors = path.resolve(colorsFilePath);
  const colorsExists = fs.existsSync(colors);

  if (colorsExists) {
    const input = fs.readFileSync(colors, "utf8");

    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      commentPropName: "comment",
      allowBooleanAttributes: true,
    });
    const xml = xmlParser.parse(input);

    if (xml) {
      // update existing splashscreen_background color
      const resources = xml.resources;

      if (!resources) {
        // if resources is empty, create a new color object
        xml.resources = {
          color: {
            "#text": backgroundColor,
            "@_name": "splashscreen_background",
          },
        };
      } else {
        const colors = resources.color;
        // validate if colors is an array or object
        if (Array.isArray(colors)) {
          // if colors is an array, try to find the splashscreen_background color
          const splashScreenColor = colors.find(
            (color) => color["@_name"] === "splashscreen_background"
          );

          // if splashscreen_background color is found, update the value
          if (splashScreenColor) {
            splashScreenColor["#text"] = backgroundColor;
          } else {
            // if splashscreen_background color is not found, create a new color object
            const newColor = {
              "#text": backgroundColor,
              "@_name": "splashscreen_background",
            };
            colors.push(newColor);
          }
        } else if (typeof colors === "object") {
          // if colors is an object, try to change #text value, else color is converted to array
          if (colors["@_name"] === "splashscreen_background") {
            colors["#text"] = backgroundColor;
          } else {
            const newColor = {
              "#text": backgroundColor,
              "@_name": "splashscreen_background",
            };
            resources.color = [colors, newColor];
          }
        }
      }

      const xmlBuilder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
        commentPropName: "comment",
        suppressBooleanAttributes: false,
        suppressUnpairedNode: false,
      });

      const xmlContent = xmlBuilder.build(xml);

      if (!XMLValidator.validate(xmlContent)) {
        throw new Error("MalformedOutputException");
      }

      fs.writeFileSync(colors, xmlContent);
    }
  } else {
    fs.mkdirSync(path.dirname(colors), { recursive: true });
    const colorsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splashscreen_background">${backgroundColor}</color>
</resources>`;

    fs.writeFileSync(colors, colorsContent);
  }
}

async function generateSplashScreenXML(flavorName) {
  const xmlFilePath = `${process.cwd()}/android/app/src/${flavorName}/res/drawable/splashscreen.xml`;
  const xml = path.resolve(xmlFilePath);
  const xmlExists = fs.existsSync(xml);

  if (xmlExists) {
    fs.rmSync(xml);
  } else {
    fs.mkdirSync(path.dirname(xml), { recursive: true });
  }

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background"/>
  <item>
    <bitmap
      android:gravity="center"
      android:src="@drawable/splashscreen_image"
    />
  </item>
</layer-list>`;

  fs.writeFileSync(xml, xmlContent);
}

module.exports = AndroidSplashScreenProcessor;
