const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

function AndroidManifestProcessor(input, config) {
  const xmlParser = new XMLParser();
  const xml = xmlParser.parse(input);

  const applications = xml.manifest.application;
  if (!applications) {
    throw new Error("MalformedResourceException");
  }

  const androidLabel = applications["@android:label"];
  if (!androidLabel) {
    throw new Error("MalformedResourceException");
  }

  applications["@android:label"] = "@string/app_name";

  const xmlBuilder = new XMLBuilder();
  const xmlOutput = xmlBuilder.buildObject(xml);

  if (!XMLValidator.validate(xmlOutput)) {
    throw new Error("MalformedOutputException");
  }

  return xmlOutput;
}

module.exports = AndroidManifestProcessor;
