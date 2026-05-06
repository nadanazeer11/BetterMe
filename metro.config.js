const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// .sql files are NOT in resolver.sourceExts — that would make Metro try to
// parse them as JavaScript. Instead, babel-plugin-inline-import (configured
// in babel.config.js) substitutes the SQL file's content as a string literal
// at compile time, so Metro never needs to traverse SQL files at all.

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
