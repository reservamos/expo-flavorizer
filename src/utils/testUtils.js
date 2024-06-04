function stripEndOfLines(input) {
  return ["\n", "\r"].reduce(
    (previousValue, element) => previousValue.replaceAll(element, ""),
    input
  );
}

module.exports = stripEndOfLines;
