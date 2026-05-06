module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Inlines the contents of imported .sql files as string literals at
      // compile time. This is what makes `import m0000 from './0000_*.sql'`
      // work in shared/db/drizzle/migrations.js — Metro never sees the .sql
      // file because the import is rewritten to a const string before Metro
      // resolves modules.
      ["babel-plugin-inline-import", { extensions: [".sql"] }],
      "react-native-worklets/plugin",
    ],
  };
};
