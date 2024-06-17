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

describe("AndroidBuildGradleProcessor", () => {
  it("Test malformed AndroidBuildGradleProcessor", () => {
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

  it("Test existing flavor dimensions exception AndroidBuildGradleProcessor", () => {
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

  it("Test existing flavor dimensions exception with begin markup AndroidBuildGradleProcessor", () => {
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

  it("Test existing flavor dimensions exception with end markup AndroidBuildGradleProcessor", () => {
    expect(() => {
      AndroidBuildGradleProcessor(content, config);
    }).toThrow();
  });
});
