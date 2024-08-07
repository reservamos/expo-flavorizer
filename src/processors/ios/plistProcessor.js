const fs = require("fs");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const {
  validateIosFolder,
  validateXcodeProj,
} = require("../../utils/validateDependencies");

async function IosPlistProcessor(plistPath, config) {
  if (!config) {
    throw new Error("NoConfigurationFileException");
  }

  const projectName = validateIosFolder();
  validateXcodeProj();

  let plistFilePath = "";
  if (!plistPath) {
    plistFilePath = `${process.cwd()}/ios/${projectName}/Info.plist`;
  } else {
    plistFilePath = plistPath;
  }

  const input = fs.readFileSync(plistFilePath, "utf8");

  const xmlParser = new XMLParser({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    parseNodeValue: false,
    preserveOrder: true,
    htmlEntities: true,
    ignoreDeclaration: false,
    processEntities: false,
    stopNodes: ["!DOCTYPE"],
    unpairedTags: ["true", "false"],
  });
  const xml = xmlParser.parse(input);

  console.log(JSON.stringify(xml, null, 2));

  //   iterate over xml objects and find the object that contains the key CFBundleIdentifier
  //   and change the value to the new value
  //   {
  // "key": [
  //     {
  //       "#text": "CFBundleName"
  //     }
  //   ]
  // },
  // {
  //   "string": [
  //     {
  //       "#text": "example"
  //     }
  //   ]
  // },

  for (const key of xml.plist.dict.key) {
    if (key["#text"] === "CFBundleIdentifier") {
      for (const string of xml.plist.dict.string) {
        if (string["#text"] === "com.example.app") {
          string["#text"] = "com.example.app2";
        }
      }
    }
  }

  const xmlBuilder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    parseNodeValue: false,
    preserveOrder: true,
    htmlEntities: true,
    ignoreDeclaration: false,
    processEntities: false,
    stopNodes: ["!DOCTYPE"],
    unpairedTags: ["true", "false"],
  });

  const xmlOutput = xmlBuilder.build(xml);

  if (!XMLValidator.validate(xmlOutput)) {
    throw new Error("MalformedOutputException");
  }

  return xmlOutput;
  //   fs.writeFileSync(plistPath, xmlOutput);
}

module.exports = IosPlistProcessor;
