const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const AndroidAdaptiveIconProcessor = require("./adaptiveIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidAdaptiveIconProcessor", () => {
  it("Test AndroidAdaptiveIconProcessor", async () => {
    const processor = await AndroidAdaptiveIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidAdaptiveIconProcessor", () => {
  it("Test malformed AndroidAdaptiveIconProcessor", async () => {
    await expect(AndroidAdaptiveIconProcessor("")).rejects.toThrow();
  });
});
