import BasePage from './BasePage';

/**
 * Explore Screen Page Object
 * - Tests explore tab navigation
 * - Tests search and filtering
 */
export class ExploreScreenPage extends BasePage {
  // Locators
  private exploreTabButton = 'android=new UiSelector().contentDescription("Explore")';
  private exploreScreenTitle = 'android=new UiSelector().text("Explore")';
  private searchInput = 'android=new UiSelector().resourceId("*.search_input")';
  private filterButton = 'android=new UiSelector().resourceId("*.filter_button")';
  private exploreContentList = 'android=new UiSelector().className("android.widget.ListView")';

  /**
   * Verify explore screen is loaded
   */
  async verifyExploreScreenLoaded(): Promise<boolean> {
    try {
      console.log('🔍 Verifying Explore Screen is loaded...');
      const isLoaded = await this.waitForElement(this.exploreScreenTitle, 5000);
      if (isLoaded) {
        console.log('✅ Explore Screen loaded successfully');
        return true;
      }
      console.warn('⚠️ Explore Screen title not found');
      return false;
    } catch (error) {
      console.error('❌ Error verifying explore screen:', error);
      return false;
    }
  }

  /**
   * Click explore tab
   */
  async clickExploreTab(): Promise<void> {
    try {
      console.log('🔍 Clicking Explore Tab...');
      await this.clickElement(this.exploreTabButton);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to click Explore Tab:', error);
      throw error;
    }
  }

  /**
   * Search for content
   */
  async searchContent(query: string): Promise<void> {
    try {
      console.log(`🔎 Searching for: ${query}`);
      await this.clickElement(this.searchInput);
      await this.inputText(this.searchInput, query);
      await this.driver.pressKeyCode(66); // Press Enter
      await this.pause(1000);
    } catch (error) {
      console.error(`❌ Failed to search: ${query}`, error);
      throw error;
    }
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    try {
      console.log('🧹 Clearing search...');
      await this.clearText(this.searchInput);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to clear search:', error);
      throw error;
    }
  }

  /**
   * Click filter button
   */
  async clickFilterButton(): Promise<void> {
    try {
      console.log('⚙️ Clicking filter button...');
      await this.clickElement(this.filterButton);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to click filter button:', error);
      throw error;
    }
  }

  /**
   * Scroll through explore list
   */
  async scrollThroughList(): Promise<void> {
    try {
      console.log('📜 Scrolling through explore list...');
      const { width, height } = await this.driver.getWindowSize();
      await this.swipe(width / 2, height * 0.7, width / 2, height * 0.2, 1000);
      await this.pause(500);
    } catch (error) {
      console.error('❌ Failed to scroll through list:', error);
      throw error;
    }
  }

  /**
   * Get explore screen content
   */
  async getExploreScreenContent(): Promise<string> {
    try {
      console.log('📋 Getting explore screen content...');
      const content = await this.driver.getPageSource();
      return content;
    } catch (error) {
      console.error('❌ Failed to get page source:', error);
      return '';
    }
  }

  /**
   * Check if list items are displayed
   */
  async areListItemsDisplayed(): Promise<boolean> {
    try {
      console.log('🎯 Checking if list items are displayed...');
      const isDisplayed = await this.isElementDisplayed(this.exploreContentList);
      return isDisplayed;
    } catch (error) {
      console.error('❌ Error checking list items:', error);
      return false;
    }
  }
}

export default ExploreScreenPage;
