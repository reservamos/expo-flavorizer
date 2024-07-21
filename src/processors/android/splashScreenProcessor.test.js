const configLoader = require("../../utils/configLoader");
const AndroidSplashScreenProcessor = require("./splashScreenProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidSplashScreenProcessor", () => {
  it("Test AndroidSplashScreenProcessor", async () => {
    const processor = await AndroidSplashScreenProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidSplashScreenProcessor", () => {
  it("Test malformed AndroidSplashScreenProcessor", async () => {
    await expect(AndroidSplashScreenProcessor("")).rejects.toThrow();
  });
});
