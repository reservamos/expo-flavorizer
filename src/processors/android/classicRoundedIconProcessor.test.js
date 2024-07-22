const configLoader = require("../../utils/configLoader");
const AndroidClassicRoundedIconProcessor = require("./classicRoundedIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidClassicRoundedIconProcessor", () => {
  it("Test AndroidClassicRoundedIconProcessor", async () => {
    const processor = await AndroidClassicRoundedIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidClassicRoundedIconProcessor", () => {
  it("Test malformed AndroidClassicRoundedIconProcessor", async () => {
    await expect(AndroidClassicRoundedIconProcessor("")).rejects.toThrow();
  });
});
