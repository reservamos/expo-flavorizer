const configLoader = require("../../utils/configLoader");
const IosXcConfigProcessor = require("./xcConfigProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosXcConfigProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosXcConfigProcessor", async () => {
      const processor = await IosXcConfigProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosXcConfigProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
