const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

function AndroidManifestProcessor(input, config) {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    commentPropName: "comment",
    allowBooleanAttributes: true,
  });
  const xml = xmlParser.parse(input);

  const application = xml.manifest.application;
  if (!application) {
    throw new Error("MalformedResourceException");
  }

  const androidLabel = application["@_android:label"];
  if (!androidLabel) {
    throw new Error("MalformedResourceException");
  }

  application["@_android:label"] = "@string/app_name";

  const xmlBuilder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    commentPropName: "comment",
    suppressBooleanAttributes: false,
    suppressUnpairedNode: false,
    unpairedTags: [
      "category",
      "uses-permission",
      "data",
      "meta-data",
      "activity",
      "action",
    ],
  });
  const xmlOutput = xmlBuilder.build(xml);

  if (!XMLValidator.validate(xmlOutput)) {
    throw new Error("MalformedOutputException");
  }

  return xmlOutput;
}

module.exports = AndroidManifestProcessor;
