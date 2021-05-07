const defaultAssetExts = require("metro-config/src/defaults/defaults").assetExts;
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: [
      ...defaultAssetExts,
      'wasm',
    ]
  }
};