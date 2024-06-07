const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const AndroidBuildGradleProcessor = require("./buildGradleProcessor");
const constants = require("../../utils/constants");
const stripEndOfLines = require("../../utils/testUtils");
const configFilePath = `${process.cwd()}/testResources/flavorizerCustomConfig.config.json`;
const config = configLoader(configFilePath);

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildOriginal.gradle`,
    "utf8"
  );
  const matcher = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorCustomConfigTest/buildExpected.gradle`,
    "utf8"
  );

  it("Test original AndroidBuildGradleProcessor with custom config", () => {
    const result = AndroidBuildGradleProcessor(content, config);
    expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
  });
});
