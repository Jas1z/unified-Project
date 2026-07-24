import { remote, RemoteOptions } from 'webdriverio';
import { appiumConfig, appiumCapabilities } from '../../config/appiumConfig';

let driver: any;

export class DriverManager {
  /**
   * Initialize Appium driver
   */
  static async initializeDriver(): Promise<any> {
    try {
      console.log('🚀 Initializing Appium Driver...');
      
      const opts: RemoteOptions = {
        hostname: appiumConfig.host,
        port: appiumConfig.port,
        path: '/wd/hub',
        logLevel: 'debug',
        capabilities: appiumCapabilities,
      };

      driver = await remote(opts);
      
      // Set implicit wait
      await driver.setImplicitWaitTimeout(appiumConfig.implicitWaitTimeout);
      
      console.log('✅ Appium Driver initialized successfully');
      return driver;
    } catch (error) {
      console.error('❌ Failed to initialize Appium Driver:', error);
      throw error;
    }
  }

  /**
   * Get current driver instance
   */
  static getDriver(): any {
    if (!driver) {
      throw new Error('Driver not initialized. Call initializeDriver() first.');
    }
    return driver;
  }

  /**
   * Quit driver and close session
   */
  static async quitDriver(): Promise<void> {
    if (driver) {
      try {
        console.log('🛑 Closing Appium Driver...');
        await driver.deleteSession();
        driver = null;
        console.log('✅ Appium Driver closed successfully');
      } catch (error) {
        console.error('❌ Error closing driver:', error);
      }
    }
  }

  /**
   * Take screenshot
   */
  static async takeScreenshot(filename: string): Promise<string> {
    try {
      const screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');
      
      const screenshotPath = path.join(appiumConfig.reportOutputPath, 'screenshots', filename);
      
      // Create screenshots directory if it doesn't exist
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      return screenshotPath;
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error);
      return '';
    }
  }

  /**
   * Wait for element to be present
   */
  static async waitForElement(selector: string, timeout: number = appiumConfig.testTimeout): Promise<boolean> {
    try {
      const element = await driver.$(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch (error) {
      console.warn(`⚠️ Element not found: ${selector}`);
      return false;
    }
  }

  /**
   * Get device info
   */
  static async getDeviceInfo(): Promise<any> {
    try {
      const info = {
        platformVersion: await driver.getPlatformVersion(),
        deviceName: await driver.getDeviceName(),
        sessionId: driver.sessionId,
      };
      return info;
    } catch (error) {
      console.error('❌ Failed to get device info:', error);
      return null;
    }
  }
}

export default DriverManager;
