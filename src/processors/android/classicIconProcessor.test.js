const configLoader = require("../../utils/configLoader");
const AndroidClassicIconProcessor = require("./classicIconProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("AndroidClassicIconProcessor", () => {
  it("Test AndroidClassicIconProcessor", () => {
    expect(() => {
      AndroidClassicIconProcessor(config);
    }).toBeDefined();
  });
});

describe("AndroidClassicIconProcessor", () => {
  it("Test malformed AndroidClassicIconProcessor", () => {
    expect(() => {
      AndroidClassicIconProcessor("");
    }).toThrow();
  });
});
