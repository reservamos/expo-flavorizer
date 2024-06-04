function wrappedValue(type, value) {
  if (type === "String") {
    return `"\\"${value}\\""`;
  }
  if (type === "char") {
    return `'\\'${value}\\''`;
  }
  return `"${value}"`;
}

module.exports = {
  wrappedValue,
};
