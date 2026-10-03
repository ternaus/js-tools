# @ternaus/eslint-plugin-react

## 9.0.0

### Major Changes

- Move the React plugin into the shared JavaScript tools workspace. Require Node.js 24.15+ or 26 and check declarations with TypeScript 7. The package name, React namespace, and React 19 / ESLint 10 rule contract are preserved.
  
  Recognize static computed property keys such as `["value"]`, `["onChange"]`, and `["href"]` in createElement calls. Controlled inputs and HTML attribute validation share the same property-name resolver.
