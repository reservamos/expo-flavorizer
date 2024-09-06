const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const AndroidManifestProcessor = require("./manifestProcessor");
const constants = require("../../utils/constants");
const stripEndOfLines = require("../../utils/testUtils");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidManifestProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/manifestProcessorTest/AndroidManifest.xml`,
    "utf8"
  );
  const matcher = fs.readFileSync(
    `${process.cwd()}/testResources/android/manifestProcessorTest/AndroidManifestExpected.xml`,
    "utf8"
  );

  it("Test original AndroidManifestProcessor", () => {
    const result = AndroidManifestProcessor(content, config);
    expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
  });
});

describe("AndroidManifestProcessor", () => {
  it("Test malformed AndroidManifestProcessor", () => {
    expect(() => {
      AndroidManifestProcessor("", config);
    }).toThrow();
  });
});
