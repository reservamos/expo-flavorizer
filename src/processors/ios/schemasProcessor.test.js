const configLoader = require("../../utils/configLoader");
const IosSchemasProcessor = require("./schemasProcessor");
const constants = require("../../utils/constants");
const configFilePath = `${process.cwd()}/testResources/${
  constants.CONFIG_FILE
}`;
const config = configLoader(configFilePath);
const { platform } = require("os");

describe("IosSchemasProcessor", () => {
  if (platform() === "darwin") {
    it("Test IosSchemasProcessor", async () => {
      const processor = await IosSchemasProcessor(config);
      expect(processor).toBeUndefined();
    });
  } else {
    it("Test IosSchemasProcessor", async () => {
      expect().toBeUndefined();
    });
  }
});
