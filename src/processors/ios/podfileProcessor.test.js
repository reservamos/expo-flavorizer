const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const IosPodfileProcessor = require("./podfileProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const stripEndOfLines = require("../../utils/testUtils");
const { platform } = require("os");

describe("IosPodfileProcessor", () => {
  if (platform() === "darwin") {
    const podfilePath = `${process.cwd()}/testResources/ios/podfileProcessorTest/Podfile`;

    const matcher = fs.readFileSync(
      `${process.cwd()}/testResources/ios/podfileProcessorTest/PodfileExpected`,
      "utf8"
    );

    it("Test IosPodfileProcessor", async () => {
      const result = await IosPodfileProcessor(podfilePath, config);
      expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
    });
  } else {
    it("Test IosPodfileProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});

describe("IosPodfileProcessor", () => {
  if (platform() === "darwin") {
    const podfilePath = `${process.cwd()}/testResources/ios/podfileProcessorTest/PodfileTwo`;

    const matcher = fs.readFileSync(
      `${process.cwd()}/testResources/ios/podfileProcessorTest/PodfileExpectedTwo`,
      "utf8"
    );

    it("Test IosPodfileProcessor with two targets", async () => {
      const result = await IosPodfileProcessor(podfilePath, config);
      expect(stripEndOfLines(result)).toEqual(stripEndOfLines(matcher));
    });
  } else {
    it("Test IosPodfileProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
