import DriverManager from '../utils/driverManager';

/**
 * Base Page Object - contains common functions for all pages
 */
export class BasePage {
  protected driver: any;

  constructor() {
    this.driver = DriverManager.getDriver();
  }

  /**
   * Wait for element visibility
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<boolean> {
    try {
      const element = await this.driver.$(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch (error) {
      console.warn(`⚠️ Element not found: ${selector}`);
      return false;
    }
  }

  /**
   * Click on element
   */
  async clickElement(selector: string): Promise<void> {
    try {
      const element = await this.driver.$(selector);
      await element.click();
      console.log(`✅ Clicked on element: ${selector}`);
    } catch (error) {
      console.error(`❌ Failed to click element: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get text from element
   */
  async getText(selector: string): Promise<string> {
    try {
      const element = await this.driver.$(selector);
      const text = await element.getText();
      console.log(`📄 Got text from ${selector}: ${text}`);
      return text;
    } catch (error) {
      console.error(`❌ Failed to get text from: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Input text into element
   */
  async inputText(selector: string, text: string): Promise<void> {
    try {
      const element = await this.driver.$(selector);
      await element.setValue(text);
      console.log(`✅ Entered text into ${selector}: ${text}`);
    } catch (error) {
      console.error(`❌ Failed to input text into: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Clear text from element
   */
  async clearText(selector: string): Promise<void> {
    try {
      const element = await this.driver.$(selector);
      await element.clearValue();
      console.log(`✅ Cleared text from: ${selector}`);
    } catch (error) {
      console.error(`❌ Failed to clear text from: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Check if element is displayed
   */
  async isElementDisplayed(selector: string): Promise<boolean> {
    try {
      const element = await this.driver.$(selector);
      const displayed = await element.isDisplayed();
      console.log(`👁️ Element displayed ${selector}: ${displayed}`);
      return displayed;
    } catch (error) {
      console.warn(`⚠️ Element not found or not displayed: ${selector}`);
      return false;
    }
  }

  /**
   * Swipe screen
   */
  async swipe(startX: number, startY: number, endX: number, endY: number, duration: number = 1000): Promise<void> {
    try {
      await this.driver.touchAction([
        { action: 'press', x: startX, y: startY },
        { action: 'wait', ms: duration },
        { action: 'moveTo', x: endX, y: endY },
        { action: 'release' },
      ]);
      console.log(`✅ Swiped from (${startX}, ${startY}) to (${endX}, ${endY})`);
    } catch (error) {
      console.error('❌ Failed to swipe:', error);
      throw error;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(filename: string): Promise<string> {
    return await DriverManager.takeScreenshot(filename);
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    try {
      await this.driver.back();
      console.log('✅ Navigated back');
    } catch (error) {
      console.error('❌ Failed to go back:', error);
      throw error;
    }
  }

  /**
   * Pause execution
   */
  async pause(milliseconds: number): Promise<void> {
    await this.driver.pause(milliseconds);
    console.log(`⏱️ Paused for ${milliseconds}ms`);
  }

  /**
   * Get element attribute
   */
  async getElementAttribute(selector: string, attributeName: string): Promise<string | null> {
    try {
      const element = await this.driver.$(selector);
      const value = await element.getAttribute(attributeName);
      console.log(`📎 Got attribute ${attributeName} from ${selector}: ${value}`);
      return value;
    } catch (error) {
      console.error(`❌ Failed to get attribute: ${attributeName} from ${selector}`, error);
      return null;
    }
  }
}

export default BasePage;
