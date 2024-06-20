const fs = require("fs");
const configLoader = require("../../utils/configLoader");
const AndroidAdaptiveIconProcessor = require("./adaptiveIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidAdaptiveIconProcessor", () => {
  it("Test AndroidAdaptiveIconProcessor", () => {
    const processor = AndroidAdaptiveIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidAdaptiveIconProcessor", () => {
  it("Test malformed AndroidAdaptiveIconProcessor", () => {
    expect(() => {
      AndroidAdaptiveIconProcessor("");
    }).toThrow();
  });
});
