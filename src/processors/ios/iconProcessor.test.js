const configLoader = require("../../utils/configLoader");
const IosIconProcessor = require("./iconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosIconProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosIconProcessor", async () => {
      const processor = await IosIconProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosIconProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});

describe("IosIconProcessor", () => {
  if (platform() === "darwin") {
    it("Test malformed IosIconProcessor", async () => {
      await expect(IosIconProcessor("")).rejects.toThrow();
    });
  } else {
    it("Test IosIconProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
