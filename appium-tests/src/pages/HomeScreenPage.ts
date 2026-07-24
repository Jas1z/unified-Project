import BasePage from './BasePage';

/**
 * Home Screen Page Object
 * - Tests home tab navigation
 * - Tests main UI elements
 */
export class HomeScreenPage extends BasePage {
  // Locators
  private homeTabButton = 'android=new UiSelector().contentDescription("Home")';
  private homeScreenTitle = 'android=new UiSelector().text("Home")';
  private mainScrollView = 'android=new UiSelector().className("android.widget.ScrollView")';

  /**
   * Verify home screen is loaded
   */
  async verifyHomeScreenLoaded(): Promise<boolean> {
    try {
      console.log('🔍 Verifying Home Screen is loaded...');
      const isLoaded = await this.waitForElement(this.homeScreenTitle, 5000);
      if (isLoaded) {
        console.log('✅ Home Screen loaded successfully');
        return true;
      }
      console.warn('⚠️ Home Screen title not found');
      return false;
    } catch (error) {
      console.error('❌ Error verifying home screen:', error);
      return false;
    }
  }

  /**
   * Click home tab
   */
  async clickHomeTab(): Promise<void> {
    try {
      console.log('🏠 Clicking Home Tab...');
      await this.clickElement(this.homeTabButton);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to click Home Tab:', error);
      throw error;
    }
  }

  /**
   * Scroll down on home screen
   */
  async scrollDown(): Promise<void> {
    try {
      console.log('📜 Scrolling down...');
      const { width, height } = await this.driver.getWindowSize();
      await this.swipe(width / 2, height * 0.7, width / 2, height * 0.2, 1000);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to scroll down:', error);
      throw error;
    }
  }

  /**
   * Scroll up on home screen
   */
  async scrollUp(): Promise<void> {
    try {
      console.log('📜 Scrolling up...');
      const { width, height } = await this.driver.getWindowSize();
      await this.swipe(width / 2, height * 0.2, width / 2, height * 0.7, 1000);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to scroll up:', error);
      throw error;
    }
  }

  /**
   * Get home screen content
   */
  async getHomeScreenContent(): Promise<string> {
    try {
      console.log('📋 Getting home screen content...');
      const content = await this.driver.getPageSource();
      return content;
    } catch (error) {
      console.error('❌ Failed to get page source:', error);
      return '';
    }
  }

  /**
   * Check if home screen is interactive
   */
  async isHomeScreenInteractive(): Promise<boolean> {
    try {
      console.log('🎯 Checking if home screen is interactive...');
      // Try to interact with the main scroll view
      const isDisplayed = await this.isElementDisplayed(this.mainScrollView);
      return isDisplayed;
    } catch (error) {
      console.error('❌ Error checking interactivity:', error);
      return false;
    }
  }
}

export default HomeScreenPage;
