const configLoader = require("../../utils/configLoader");
const IosBuildTargetsProcessor = require("./buildTargetsProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);

describe("IosBuildTargetsProcessor", () => {
  it("Test IosBuildTargetsProcessor", async () => {
    const processor = await IosBuildTargetsProcessor(config);
    expect(processor).toBeUndefined();
  });
});
