const configLoader = require("../../utils/configLoader");
const IosIconProcessor = require("./iconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("IosIconProcessor", () => {
  it("Test IosIconProcessor", () => {
    const processor = IosIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("IosIconProcessor", () => {
  it("Test malformed IosIconProcessor", () => {
    expect(() => {
      IosIconProcessor("");
    }).toThrow();
  });
});
