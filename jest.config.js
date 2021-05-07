module.exports = {
  preset: 'react-native',
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-view-shot|expo-gl|@unimodules)/)'
  ],
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js'
  ],
};
