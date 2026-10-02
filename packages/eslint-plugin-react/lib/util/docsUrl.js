function docsUrl(ruleName) {
  return `https://ternaus.github.io/js-tools/eslint-plugin-react/rules/${ruleName}`;
}

const exported = docsUrl;

export default exported;
export { exported as 'module.exports' };
