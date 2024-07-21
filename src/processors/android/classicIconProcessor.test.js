const configLoader = require("../../utils/configLoader");
const AndroidClassicIconProcessor = require("./classicIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidClassicIconProcessor", () => {
  it("Test AndroidClassicIconProcessor", async () => {
    const processor = await AndroidClassicIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidClassicIconProcessor", () => {
  it("Test malformed AndroidClassicIconProcessor", async () => {
    await expect(AndroidClassicIconProcessor("")).rejects.toThrow();
  });
});
