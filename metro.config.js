const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
);
config.resolver.sourceExts.push("svg");

// Add support for .env files
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
