const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const AndroidBuildGradleProcessor = require("./buildGradleProcessor");
const constants = require("../../utils/constants");
const stripEndOfLines = require("../../utils/testUtils");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildOriginal.gradle`,
    "utf8"
  );
  const matcher = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildExpected.gradle`,
    "utf8"
  );

  it("Test original AndroidBuildGradleProcessor", () => {
    const result = AndroidBuildGradleProcessor(content, config);
    expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
  });
});

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildIdempotent.gradle`,
    "utf8"
  );
  const matcher = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildExpected.gradle`,
    "utf8"
  );

  it("Test idempotent AndroidBuildGradleProcessor", () => {
    const result = AndroidBuildGradleProcessor(content, config);
    expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
  });
});
