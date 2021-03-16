module.exports = {
  preset: 'react-native',
  // preset: 'jest-expo/universal',
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-view-shot)/)'
  ],
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js'
  ],
};
