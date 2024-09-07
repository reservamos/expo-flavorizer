#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const program = new Command();

const bootstrap = require("../src/utils/bootstrap");
const initConfigAction = require("../src/actions/initConfigAction");
const listAction = require("../src/actions/listAction");
const applyAction = require("../src/actions/applyAction");
const addFlavorAction = require("../src/actions/addFlavorAction");
const removeFlavorAction = require("../src/actions/removeFlavorAction");
const version = require("../package.json").version;

program
  .name("flavorizer")
  .version(version)
  .description("Expo Flavorizer by Reservamos")
  .exitOverride((_) => {
    process.exit(0);
  });

program
  .command("list")
  .description("List all flavors existing in the configuration file")
  .action(bootstrap(listAction));

program
  .command("init")
  .description("Initialize the flavorizer configuration file")
  .action(bootstrap(initConfigAction));

program
  .command("add")
  .description("Add a new flavor to the configuration file")
  .action(bootstrap(addFlavorAction));

program
  .command("remove")
  .description("Remove an existing flavor from the configuration file")
  .arguments("[flavorName]", "Name of the flavor to remove (optional)")
  .action(bootstrap(removeFlavorAction));

program
  .command("apply")
  .description("Apply all changes to the expo project")
  .action(bootstrap(applyAction));

program.parse(process.argv);
