#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const program = new Command();

const bootstrap = require("../src/utils/bootstrap");
const initAction = require("../src/actions/initAction");
const listAction = require("../src/actions/listAction");
const createAction = require("../src/actions/createAction");

program
  .name("flavorizer")
  .version("1.0.0")
  .description("React Native Flavorizer CLI")
  .exitOverride((_) => {
    process.exit(0);
  });

program
  .command("list")
  .description("List all flavors")
  .action(bootstrap(listAction));

program
  .command("init")
  .description("Initialize the flavorizer configuration")
  .action(bootstrap(initAction));

program
  .command("create")
  .description("Create a new flavor")
  .action(bootstrap(createAction));

program.parse(process.argv);
