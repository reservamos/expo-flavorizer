const configLoader = require("../../utils/configLoader");
const AndroidClassicRoundedIconProcessor = require("./classicRoundedIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidClassicRoundedIconProcessor", () => {
  it("Test AndroidClassicRoundedIconProcessor", () => {
    const processor = AndroidClassicRoundedIconProcessor(config);
    expect(processor).toBeUndefined();
  });
});

describe("AndroidClassicRoundedIconProcessor", () => {
  it("Test malformed AndroidClassicRoundedIconProcessor", () => {
    expect(() => {
      AndroidClassicRoundedIconProcessor("");
    }).toThrow();
  });
});
