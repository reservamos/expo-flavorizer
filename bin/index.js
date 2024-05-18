#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const program = new Command();

const bootstrap = require("../src/utils/bootstrap");
const initConfigAction = require("../src/actions/initConfigAction");
const listAction = require("../src/actions/listAction");
const addFlavorAction = require("../src/actions/addFlavorAction");
const removeFlavorAction = require("../src/actions/removeFlavorAction");

program
  .name("flavorizer")
  .version("1.0.0")
  .description("React Native Flavorizer CLI")
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
  .action(bootstrap(removeFlavorAction));

program
  .command("apply")
  .description("Apply all changes to the react native project")
  .action(bootstrap(listAction));

program.parse(process.argv);
