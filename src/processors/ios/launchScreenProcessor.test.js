const configLoader = require("../../utils/configLoader");
const IosLaunchScreenProcessor = require("./launchScreenProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosLaunchScreenProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosLaunchScreenProcessor", async () => {
      const processor = await IosLaunchScreenProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosLaunchScreenProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
