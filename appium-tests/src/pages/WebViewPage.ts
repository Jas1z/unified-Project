import BasePage from './BasePage';

/**
 * WebView Page Object
 * - Tests web content loading
 * - Tests web interactions
 */
export class WebViewPage extends BasePage {
  // Locators
  private webViewElement = 'android=new UiSelector().className("android.webkit.WebView")';
  private webPageTitle = 'xpath=//*[@class="header-title"]';

  /**
   * Verify WebView is loaded
   */
  async verifyWebViewLoaded(): Promise<boolean> {
    try {
      console.log('🔍 Verifying WebView is loaded...');
      const isLoaded = await this.waitForElement(this.webViewElement, 10000);
      if (isLoaded) {
        console.log('✅ WebView loaded successfully');
        return true;
      }
      console.warn('⚠️ WebView not found');
      return false;
    } catch (error) {
      console.error('❌ Error verifying WebView:', error);
      return false;
    }
  }

  /**
   * Get WebView page title
   */
  async getPageTitle(): Promise<string> {
    try {
      console.log('📄 Getting WebView page title...');
      // Switch to WebView context
      const contexts = await this.driver.getContexts();
      const webViewContext = contexts.find((ctx: string) => ctx.includes('WEBVIEW'));
      
      if (webViewContext) {
        await this.driver.switchContext(webViewContext);
        const title = await this.driver.getTitle();
        console.log(`✅ Page title: ${title}`);
        return title;
      }
      console.warn('⚠️ WebView context not found');
      return '';
    } catch (error) {
      console.error('❌ Error getting page title:', error);
      return '';
    }
  }

  /**
   * Switch to WebView context
   */
  async switchToWebView(): Promise<void> {
    try {
      console.log('🔄 Switching to WebView context...');
      const contexts = await this.driver.getContexts();
      const webViewContext = contexts.find((ctx: string) => ctx.includes('WEBVIEW'));
      
      if (webViewContext) {
        await this.driver.switchContext(webViewContext);
        console.log('✅ Switched to WebView context');
      } else {
        console.warn('⚠️ WebView context not found');
      }
    } catch (error) {
      console.error('❌ Error switching context:', error);
      throw error;
    }
  }

  /**
   * Switch to native context
   */
  async switchToNative(): Promise<void> {
    try {
      console.log('🔄 Switching to Native context...');
      const contexts = await this.driver.getContexts();
      const nativeContext = contexts.find((ctx: string) => ctx === 'NATIVE_APP');
      
      if (nativeContext) {
        await this.driver.switchContext(nativeContext);
        console.log('✅ Switched to Native context');
      } else {
        console.warn('⚠️ Native context not found');
      }
    } catch (error) {
      console.error('❌ Error switching to native:', error);
      throw error;
    }
  }

  /**
   * Execute JavaScript in WebView
   */
  async executeScript(script: string): Promise<any> {
    try {
      console.log('📜 Executing JavaScript...');
      const result = await this.driver.execute(script);
      console.log('✅ Script executed successfully');
      return result;
    } catch (error) {
      console.error('❌ Error executing script:', error);
      throw error;
    }
  }

  /**
   * Check if WebView is responsive
   */
  async isWebViewResponsive(): Promise<boolean> {
    try {
      console.log('🎯 Checking WebView responsiveness...');
      const isDisplayed = await this.isElementDisplayed(this.webViewElement);
      return isDisplayed;
    } catch (error) {
      console.error('❌ Error checking responsiveness:', error);
      return false;
    }
  }

  /**
   * Get all available contexts
   */
  async getAvailableContexts(): Promise<string[]> {
    try {
      console.log('🔍 Getting available contexts...');
      const contexts = await this.driver.getContexts();
      console.log(`✅ Available contexts: ${contexts.join(', ')}`);
      return contexts;
    } catch (error) {
      console.error('❌ Error getting contexts:', error);
      return [];
    }
  }

  /**
   * Navigate to URL in WebView
   */
  async navigateToUrl(url: string): Promise<void> {
    try {
      console.log(`🌐 Navigating to ${url}...`);
      const contexts = await this.driver.getContexts();
      const webViewContext = contexts.find((ctx: string) => ctx.includes('WEBVIEW'));
      
      if (webViewContext) {
        await this.driver.switchContext(webViewContext);
        await this.driver.navigateTo(url);
        console.log('✅ Navigated to URL');
      }
    } catch (error) {
      console.error('❌ Error navigating to URL:', error);
      throw error;
    }
  }
}

export default WebViewPage;
