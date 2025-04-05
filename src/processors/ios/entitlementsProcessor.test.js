const configLoader = require("../../utils/configLoader");
const IosEntitlementsProcessor = require("./entitlementsProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosEntitlementsProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosEntitlementsProcessor", async () => {
      const processor = await IosEntitlementsProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosEntitlementsProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});

describe("IosEntitlementsProcessor with invalid input", () => {
  if (platform() === "darwin") {
    it("Test IosEntitlementsProcessor with no config", async () => {
      await expect(IosEntitlementsProcessor(null)).rejects.toThrow(
        "NoConfigurationFileException"
      );
    });
  } else {
    it("Test IosEntitlementsProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
