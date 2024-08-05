const configLoader = require("../../utils/configLoader");
const IosLaunchScreenProcessor = require("./launchScreenProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("IosLaunchScreenProcessor", () => {
  it("Test IosLaunchScreenProcessor", async () => {
    const processor = await IosLaunchScreenProcessor(config);
    expect(processor).toBeUndefined();
  });
});
