import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const appiumConfig = {
  // Appium Server Configuration
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723'),
  timeout: parseInt(process.env.APPIUM_TIMEOUT || '30000'),

  // Android Device Configuration
  platformName: process.env.ANDROID_PLATFORM_NAME || 'Android',
  platformVersion: process.env.ANDROID_PLATFORM_VERSION || '14',
  deviceName: process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
  automationName: process.env.ANDROID_AUTOMATION_NAME || 'UiAutomator2',
  appPackage: process.env.ANDROID_APP_PACKAGE || 'com.anonymous.ehrmobile',
  appActivity: process.env.ANDROID_APP_ACTIVITY || '.MainActivity',

  // App Configuration
  app: process.env.APK_PATH || path.join(__dirname, '../ehr-mobile/android/app/build/outputs/apk/release/app-release.apk'),

  // Test Configuration
  testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  implicitWaitTimeout: parseInt(process.env.IMPLICIT_WAIT || '10000'),
  screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE === 'true',

  // Web Configuration
  webAppUrl: process.env.WEB_APP_URL || 'http://10.0.2.2:5173',

  // Report Configuration
  reportOutputPath: process.env.REPORT_OUTPUT_PATH || './reports',
  reportFilename: process.env.REPORT_FILENAME || 'ehr-mobile-test-report',
  generateExcelReport: process.env.GENERATE_EXCEL_REPORT === 'true',
};

export const appiumCapabilities = {
  platformName: appiumConfig.platformName,
  'appium:platformVersion': appiumConfig.platformVersion,
  'appium:deviceName': appiumConfig.deviceName,
  'appium:automationName': appiumConfig.automationName,
  'appium:app': appiumConfig.app,
  'appium:appPackage': appiumConfig.appPackage,
  'appium:appActivity': appiumConfig.appActivity,
  'appium:autoGrantPermissions': true,
  'appium:noReset': false,
  'appium:fullReset': false,
};

export const webViewCapabilities = {
  ...appiumCapabilities,
  'appium:chromeOptions': {
    w3c: false,
  },
};
