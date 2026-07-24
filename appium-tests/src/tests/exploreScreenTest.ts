import DriverManager from '../utils/driverManager';
import ExploreScreenPage from '../pages/ExploreScreenPage';

/**
 * Explore Screen End-to-End Tests
 */
export class ExploreScreenTest {
  private exploreScreenPage: ExploreScreenPage;
  private testResults: any[] = [];

  constructor() {
    this.exploreScreenPage = new ExploreScreenPage();
  }

  /**
   * Test 1: Verify explore screen loads
   */
  async testExploreScreenLoad(): Promise<void> {
    const testName = 'Explore Screen Load';
    const startTime = new Date();
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running: ${testName}`);
      console.log(`${'='.repeat(60)}`);

      const isLoaded = await this.exploreScreenPage.verifyExploreScreenLoaded();
      
      if (isLoaded) {
        console.log(`✅ PASSED: ${testName}`);
        this.testResults.push({
          testName,
          status: 'PASSED',
          duration: new Date().getTime() - startTime.getTime(),
          error: null,
        });
      } else {
        throw new Error('Explore screen did not load');
      }
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`, error);
      this.testResults.push({
        testName,
        status: 'FAILED',
        duration: new Date().getTime() - startTime.getTime(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Test 2: Verify explore tab navigation
   */
  async testExploreTabNavigation(): Promise<void> {
    const testName = 'Explore Tab Navigation';
    const startTime = new Date();
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running: ${testName}`);
      console.log(`${'='.repeat(60)}`);

      await this.exploreScreenPage.clickExploreTab();
      await this.exploreScreenPage.pause(1000);
      
      const isLoaded = await this.exploreScreenPage.verifyExploreScreenLoaded();
      
      if (isLoaded) {
        console.log(`✅ PASSED: ${testName}`);
        this.testResults.push({
          testName,
          status: 'PASSED',
          duration: new Date().getTime() - startTime.getTime(),
          error: null,
        });
      } else {
        throw new Error('Failed to navigate to explore tab');
      }
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`, error);
      this.testResults.push({
        testName,
        status: 'FAILED',
        duration: new Date().getTime() - startTime.getTime(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Test 3: Verify list items are displayed
   */
  async testListItemsDisplay(): Promise<void> {
    const testName = 'Explore List Items Display';
    const startTime = new Date();
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running: ${testName}`);
      console.log(`${'='.repeat(60)}`);

      const areDisplayed = await this.exploreScreenPage.areListItemsDisplayed();
      
      if (areDisplayed) {
        console.log(`✅ PASSED: ${testName}`);
        this.testResults.push({
          testName,
          status: 'PASSED',
          duration: new Date().getTime() - startTime.getTime(),
          error: null,
        });
      } else {
        throw new Error('List items not displayed');
      }
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`, error);
      this.testResults.push({
        testName,
        status: 'FAILED',
        duration: new Date().getTime() - startTime.getTime(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Test 4: Verify list scrolling
   */
  async testListScrolling(): Promise<void> {
    const testName = 'Explore List Scrolling';
    const startTime = new Date();
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running: ${testName}`);
      console.log(`${'='.repeat(60)}`);

      await this.exploreScreenPage.scrollThroughList();
      await this.exploreScreenPage.pause(500);
      
      const areDisplayed = await this.exploreScreenPage.areListItemsDisplayed();
      
      if (areDisplayed) {
        console.log(`✅ PASSED: ${testName}`);
        this.testResults.push({
          testName,
          status: 'PASSED',
          duration: new Date().getTime() - startTime.getTime(),
          error: null,
        });
      } else {
        throw new Error('Failed to scroll through list');
      }
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`, error);
      this.testResults.push({
        testName,
        status: 'FAILED',
        duration: new Date().getTime() - startTime.getTime(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Test 5: Verify explore screen content
   */
  async testExploreScreenContent(): Promise<void> {
    const testName = 'Explore Screen Content';
    const startTime = new Date();
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running: ${testName}`);
      console.log(`${'='.repeat(60)}`);

      const content = await this.exploreScreenPage.getExploreScreenContent();
      
      if (content && content.length > 0) {
        console.log(`✅ PASSED: ${testName} (Content length: ${content.length})`);
        this.testResults.push({
          testName,
          status: 'PASSED',
          duration: new Date().getTime() - startTime.getTime(),
          error: null,
        });
      } else {
        throw new Error('No content found on explore screen');
      }
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`, error);
      this.testResults.push({
        testName,
        status: 'FAILED',
        duration: new Date().getTime() - startTime.getTime(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get all test results
   */
  getResults(): any[] {
    return this.testResults;
  }

  /**
   * Run all explore screen tests
   */
  async runAllTests(): Promise<void> {
    console.log('\n🔍 Starting Explore Screen Tests...\n');
    
    try {
      await this.testExploreScreenLoad();
      await this.testExploreTabNavigation();
      await this.testListItemsDisplay();
      await this.testListScrolling();
      await this.testExploreScreenContent();
      
      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ All explore screen tests completed!');
      console.log(`${'='.repeat(60)}\n`);
    } catch (error) {
      console.error('\n❌ Error running tests:', error);
    }
  }
}

export default ExploreScreenTest;
