const configLoader = require("../../utils/configLoader");
const IosXcPrivacyInfoProcessor = require("./xcPrivacyInfoProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosXcPrivacyInfoProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosXcPrivacyInfoProcessor", async () => {
      const processor = await IosXcPrivacyInfoProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosXcPrivacyInfoProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
