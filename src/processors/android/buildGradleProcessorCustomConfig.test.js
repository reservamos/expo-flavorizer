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

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildIdempotent.gradle`,
    "utf8"
  );
  const matcher = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorCustomConfigTest/buildExpected.gradle`,
    "utf8"
  );

  it("Test idempotent AndroidBuildGradleProcessor with custom config", () => {
    const result = AndroidBuildGradleProcessor(content, config);
    expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
  });
});

describe("AndroidBuildGradleProcessor", () => {
  it("Test malformed AndroidBuildGradleProcessor with custom config", () => {
    expect(() => {
      AndroidBuildGradleProcessor("", config);
    }).toThrow();
  });
});

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildMalformedOne.gradle`,
    "utf8"
  );

  it("Test existing flavor dimensions exception AndroidBuildGradleProcessor with custom config", () => {
    expect(() => {
      AndroidBuildGradleProcessor(content, config);
    }).toThrow();
  });
});

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildMalformedTwo.gradle`,
    "utf8"
  );

  it("Test malformed AndroidBuildGradleProcessor with custom config", () => {
    expect(() => {
      AndroidBuildGradleProcessor(content, config);
    }).toThrow();
  });
});

describe("AndroidBuildGradleProcessor", () => {
  const content = fs.readFileSync(
    `${process.cwd()}/testResources/android/buildGradleProcessorTest/buildMalformedThree.gradle`,
    "utf8"
  );

  it("Test malformed AndroidBuildGradleProcessor with custom config", () => {
    expect(() => {
      AndroidBuildGradleProcessor(content, config);
    }).toThrow();
  });
});
