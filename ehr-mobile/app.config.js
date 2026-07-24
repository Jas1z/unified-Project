/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

// Baked into release APK via app.config → Constants.expoConfig.extra.webAppUrl
const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL;

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      webAppUrl,
    },
  },
};
