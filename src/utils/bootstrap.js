const chalk = require("chalk");
const figlet = require("figlet");

const headerText = "React Native\nFlavorizer";
const textConfig = {
  font: "speed",
  horizontalLayout: "default",
  verticalLayout: "default",
};

const printText = (cb) => {
  const onTextResolved = (err, data) => {
    console.clear();
    console.log(chalk.blue(err ? headerText : data));
    cb();
  };
  figlet.text(headerText, textConfig, onTextResolved);
};

module.exports =
  (action) =>
  (...args) =>
    printText(() => action(...args));
