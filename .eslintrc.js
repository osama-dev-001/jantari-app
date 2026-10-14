module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Styles are built from the active theme palette at render time, so most
    // are necessarily inline; StyleSheet.create can't see the palette.
    'react-native/no-inline-styles': 'off',
  },
};
