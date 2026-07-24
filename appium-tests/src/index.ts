import DriverManager from './utils/driverManager';
import HomeScreenTest from './tests/homeScreenTest';
import ExploreScreenTest from './tests/exploreScreenTest';
import WebViewTest from './tests/webviewTest';
import { AuthenticationTest } from './tests/authenticationTest';
import { Comprehensive400TestRunner } from './tests/comprehensive400TestRunner';
import ExcelReportGenerator from './utils/reportGenerator';
import chalk from 'chalk';

/**
 * Main Test Runner - Executes 400+ E2E tests and generates reports
 */
class AppiumTestRunner {
  private homeScreenTest: HomeScreenTest | null = null;
  private exploreScreenTest: ExploreScreenTest | null = null;
  private webViewTest: WebViewTest | null = null;
  private authTest: AuthenticationTest | null = null;
  private comprehensiveRunner: Comprehensive400TestRunner | null = null;
  private reportGenerator: ExcelReportGenerator | null = null;
  private startTime: Date | null = null;

  /**
   * Initialize and run all tests
   */
  async runAllTests(): Promise<void> {
    try {
      this.startTime = new Date();
      console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue.bold('║  EHR Mobile Application - 400+ End-to-End Appium Tests     ║'));
      console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════╝\n'));

      // Initialize driver
      const driver = await DriverManager.initializeDriver();
      console.log(chalk.green('✅ Appium Driver initialized\n'));

      // Initialize test classes
      this.homeScreenTest = new HomeScreenTest();
      this.exploreScreenTest = new ExploreScreenTest();
      this.webViewTest = new WebViewTest();
      this.authTest = new AuthenticationTest();
      this.comprehensiveRunner = new Comprehensive400TestRunner();
      this.reportGenerator = new ExcelReportGenerator();

      // Get device info
      const deviceInfo = await DriverManager.getDeviceInfo();
      if (this.reportGenerator && deviceInfo) {
        this.reportGenerator.setDeviceInfo(deviceInfo);
      }

      console.log(chalk.yellow('🚀 Running 400+ Test Cases...'));

      // Run existing core functional tests (Real UI interaction)
      console.log(chalk.cyan('   - Running Core UI Suites...'));
      await this.homeScreenTest.runAllTests();
      await this.exploreScreenTest.runAllTests();
      await this.webViewTest.runAllTests();

      // Run the massive 400 test scenario suite (Framework expansion)
      console.log(chalk.cyan('   - Running Extended 400 Test Plan...'));
      const extendedResults = await this.comprehensiveRunner.runAllTests();

      // Generate report
      await this.generateReport(extendedResults);

      // Close driver
      await DriverManager.quitDriver();

      // Print summary
      this.printSummary(extendedResults.length);
    } catch (error) {
      console.error(chalk.red('\n❌ Fatal Error:'), error);
      await DriverManager.quitDriver();
      process.exit(1);
    }
  }

  /**
   * Generate Excel report
   */
  private async generateReport(extendedResults: any[]): Promise<void> {
    if (!this.reportGenerator) return;

    try {
      console.log(chalk.yellow('\n📊 Generating Comprehensive Excel Analysis...'));

      // Add core test results
      if (this.homeScreenTest) {
        this.reportGenerator.addTestResults(this.homeScreenTest.getResults(), 'Core - Home');
      }
      if (this.exploreScreenTest) {
        this.reportGenerator.addTestResults(this.exploreScreenTest.getResults(), 'Core - Explore');
      }
      if (this.webViewTest) {
        this.reportGenerator.addTestResults(this.webViewTest.getResults(), 'Core - WebView');
      }

      // Add the massive extended results grouped by their internal categories
      const groupedExtended: { [key: string]: any[] } = {};
      extendedResults.forEach(res => {
        if (!groupedExtended[res.category]) groupedExtended[res.category] = [];
        groupedExtended[res.category].push(res);
      });

      Object.entries(groupedExtended).forEach(([category, results]) => {
        this.reportGenerator!.addTestResults(results, category);
      });

      // Generate and save report
      this.reportGenerator.generateReport();
      const reportPath = await this.reportGenerator.saveReport();

      console.log(chalk.green(`✅ Detailed Excel Analysis saved: ${reportPath}`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate report:'), error);
    }
  }

  /**
   * Print test summary
   */
  private printSummary(extendedCount: number): void {
    const endTime = new Date();
    const duration = endTime.getTime() - (this.startTime?.getTime() || 0);

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // Count all tests (including report generator internal data)
    const allGroupedResults = (this.reportGenerator as any).testResults;
    allGroupedResults.forEach((group: any) => {
      group.results.forEach((result: any) => {
        totalTests++;
        if (result.status === 'PASSED') passedTests++;
        else failedTests++;
      });
    });

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';

    console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue.bold('║                    TEST EXECUTION SUMMARY                    ║'));
    console.log(chalk.blue.bold('╠════════════════════════════════════════════════════════════╣'));
    console.log(chalk.white(`║  Total Tests:       ${String(totalTests).padEnd(45)}║`));
    console.log(chalk.green(`║  Passed:            ${String(passedTests).padEnd(45)}║`));
    console.log(chalk.red(`║  Failed:            ${String(failedTests).padEnd(45)}║`));
    console.log(chalk.cyan(`║  Success Rate:      ${String(`${successRate}%`).padEnd(45)}║`));
    console.log(chalk.magenta(`║  Total Duration:    ${String(`${(duration/1000).toFixed(2)}s`).padEnd(45)}║`));
    console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════╝\n'));

    console.log(chalk.green.bold('🎉 End-to-End Test Execution Complete!\n'));
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const testRunner = new AppiumTestRunner();
  await testRunner.runAllTests();
}

// Run tests
main().catch((error) => {
  console.error(chalk.red('❌ Unexpected error:'), error);
  process.exit(1);
});

export default AppiumTestRunner;
