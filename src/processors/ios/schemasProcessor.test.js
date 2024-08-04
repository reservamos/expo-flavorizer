const configLoader = require("../../utils/configLoader");
const IosSchemasProcessor = require("./schemasProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("IosSchemasProcessor", () => {
  it("Test IosSchemasProcessor", async () => {
    const processor = await IosSchemasProcessor(config);
    expect(processor).toBeUndefined();
  });
});
