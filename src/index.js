#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const program = new Command();

program
  .name("flavorizer")
  .version("1.0.0")
  .description("React Native Flavorizer CLI")
  .exitOverride((_) => {
    process.exit(0);
  });

program
  .command("create")
  .description("Create a new flavor")
  .action(() => {
    console.log(chalk.green("Creating a new flavor"));
  });

program.parse(process.argv);
