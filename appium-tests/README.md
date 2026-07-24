# Appium E2E Test Framework for EHR Mobile Application

This folder contains a comprehensive end-to-end (E2E) testing framework for the EHR Mobile Application using Appium. The framework includes automated tests for all major screens and features, with automated Excel report generation.

## 📋 Project Structure

```
appium-tests/
├── config/                          # Configuration files
│   └── appiumConfig.ts             # Appium and test configuration
├── src/
│   ├── tests/                      # Test suites
│   │   ├── homeScreenTest.ts       # Home screen tests
│   │   ├── exploreScreenTest.ts    # Explore screen tests
│   │   └── webviewTest.ts          # WebView tests
│   ├── pages/                      # Page Object Models
│   │   ├── BasePage.ts             # Base page with common functions
│   │   ├── HomeScreenPage.ts       # Home screen POM
│   │   ├── ExploreScreenPage.ts    # Explore screen POM
│   │   └── WebViewPage.ts          # WebView POM
│   ├── utils/                      # Utility functions
│   │   ├── driverManager.ts        # Appium driver management
│   │   └── reportGenerator.ts      # Excel report generation
│   └── index.ts                    # Main test runner
├── reports/                        # Generated test reports
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

## 🧪 Test Coverage

### Home Screen Tests (5 tests)
- ✅ App launch and home screen load
- ✅ Home tab navigation
- ✅ Home screen scroll functionality
- ✅ Home screen content loading
- ✅ Home screen UI responsiveness

### Explore Screen Tests (5 tests)
- ✅ Explore screen load
- ✅ Explore tab navigation
- ✅ List items display
- ✅ List scrolling functionality
- ✅ Explore screen content verification

### WebView Tests (5 tests)
- ✅ WebView load verification
- ✅ WebView context switching
- ✅ WebView responsiveness
- ✅ Page title verification
- ✅ JavaScript execution in WebView

**Total: 15 end-to-end test cases**

## 🚀 Getting Started

### Prerequisites

1. **Appium Server** - Install and run Appium server
   ```bash
   npm install -g appium
   appium
   ```

2. **Android SDK** - Ensure Android SDK is installed and configured
   ```bash
   # Set ANDROID_HOME environment variable
   set ANDROID_HOME=C:\Android\sdk  # Windows
   ```

3. **Android Emulator** - Start an Android emulator or connect a physical device
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start emulator
   emulator -avd emulator_name
   ```

4. **Node.js** - Install Node.js 16 or higher

### Installation

1. Clone/navigate to the `appium-tests` directory
   ```bash
   cd appium-tests
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Build the compiled app
   ```bash
   # In the main project directory
   npm run build:android
   # Or generate a release APK
   eas build --platform android --local
   ```

## 📝 Configuration

Edit `.env` file to customize test parameters:

```env
# Appium Server Configuration
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723

# Android Device Configuration
ANDROID_DEVICE_NAME=emulator-5554
ANDROID_PLATFORM_VERSION=14
ANDROID_APP_PACKAGE=com.anonymous.ehrmobile
ANDROID_APP_ACTIVITY=.MainActivity

# Test Configuration
TEST_TIMEOUT=30000
IMPLICIT_WAIT=10000

# Report Configuration
REPORT_OUTPUT_PATH=./reports
REPORT_FILENAME=ehr-mobile-test-report
```

## 🧪 Running Tests

### Run all tests
```bash
npm run test
# or
npm run test:all
```

### Run specific test suite
```bash
npm run test:home      # Home screen tests
npm run test:explore   # Explore screen tests
npm run test:webview   # WebView tests
```

### Build TypeScript
```bash
npm run build
```

### Clean build artifacts
```bash
npm run clean
```

## 📊 Test Reports

After running tests, an Excel report is automatically generated in the `reports/` folder.

### Report Contents:
- **Test Results Sheet** - Detailed results for each test case
  - Test Number
  - Test Name
  - Status (PASSED/FAILED)
  - Duration (ms)
  - Error Messages
  - Test Category
  - Date and Time
  - Color-coded status (green for passed, red for failed)

- **Summary Statistics**
  - Total Tests
  - Passed Tests
  - Failed Tests
  - Success Rate
  - Total Duration

- **Device Information Sheet**
  - Device name
  - Platform and version
  - Automation engine
  - App package and activity
  - Configuration details
  - Report generation timestamp

### Report File Naming
```
ehr-mobile-test-report-YYYY-MM-DD-HH-mm-ss.xlsx
```

## 🏗️ Architecture

### Page Object Model (POM)
The framework uses the Page Object Model pattern for maintainability:

- **BasePage** - Contains common functions like:
  - `waitForElement()` - Wait for element visibility
  - `clickElement()` - Click on elements
  - `getText()` - Get text from elements
  - `inputText()` - Input text into fields
  - `swipe()` - Swipe on screen
  - `takeScreenshot()` - Capture screenshots
  - `goBack()` - Navigate back

- **Specific Page Objects** - Inherit from BasePage:
  - `HomeScreenPage` - Home screen locators and actions
  - `ExploreScreenPage` - Explore screen locators and actions
  - `WebViewPage` - WebView context management

### Test Classes
Each test file follows this structure:
```typescript
async testFeatureName(): Promise<void> {
  const testName = 'Feature Name';
  const startTime = new Date();
  
  try {
    // Test implementation
    // Assert results
    // Record pass
  } catch (error) {
    // Record fail
  }
}
```

### Driver Manager
Central management for Appium driver:
- Initialize driver with capabilities
- Manage driver lifecycle
- Capture screenshots
- Wait for elements
- Get device information

## 🔧 Troubleshooting

### Appium Server Connection Failed
```bash
# Ensure Appium is running
appium

# Check if port 4723 is available
netstat -ano | findstr :4723

# Try a different port in .env
APPIUM_PORT=4724
```

### Element Not Found
- Verify locator selectors are correct
- Check if element exists in current screen
- Increase timeout values in `.env`
- Use `adb shell input keyevent 3` to take screenshots for inspection

### WebView Context Not Found
- Ensure WebView is loaded
- Check if app has WebView component
- Use Chrome DevTools for debugging

### Tests Failing Intermittently
- Increase `IMPLICIT_WAIT` and `TEST_TIMEOUT` values
- Add additional wait conditions
- Ensure device has enough resources

## 📚 Useful Commands

```bash
# List available Android devices
adb devices

# Get device logs
adb logcat

# Take screenshot from device
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png .

# Clear app data
adb shell pm clear com.anonymous.ehrmobile

# Install APK
adb install app-release.apk

# Uninstall app
adb uninstall com.anonymous.ehrmobile
```

## 🌐 WebView Testing

For testing WebView content:

1. **Context Switching**
   ```typescript
   await webViewPage.switchToWebView();
   // Do WebView actions
   await webViewPage.switchToNative();
   ```

2. **JavaScript Execution**
   ```typescript
   const result = await webViewPage.executeScript('return document.title');
   ```

3. **Check Available Contexts**
   ```typescript
   const contexts = await webViewPage.getAvailableContexts();
   ```

## 📱 Device Capabilities

The framework is configured for:
- **Platform**: Android
- **Automation**: UiAutomator2
- **App Package**: com.anonymous.ehrmobile
- **App Activity**: .MainActivity
- **Auto Grant Permissions**: Yes
- **Full Reset**: No
- **No Reset**: False

Modify in `config/appiumConfig.ts` for different settings.

## 🔐 Security

- Keep `.env` file confidential
- Don't commit `.env` to version control
- Use `.env.example` for template
- Rotate credentials periodically

## 📈 Extending the Framework

### Adding New Tests

1. Create a new test file in `src/tests/`
2. Extend from the base test pattern
3. Implement test methods
4. Update `src/index.ts` to include new tests

### Adding New Page Objects

1. Create a new file in `src/pages/`
2. Extend `BasePage`
3. Define locators
4. Implement page-specific actions

### Custom Assertions

```typescript
private async assertEqual(actual: any, expected: any): Promise<boolean> {
  return actual === expected;
}
```

## 🤝 Contributing

When adding tests:
1. Follow existing naming conventions
2. Use descriptive test names
3. Add comments explaining complex logic
4. Update this README with new test coverage
5. Ensure all tests pass before committing

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Appium documentation: https://appium.io/docs/
3. Check WebdriverIO documentation: https://webdriver.io/

## 📄 License

MIT License - See LICENSE file in root directory

## 🎯 Best Practices

1. **Always clean up resources**
   - Properly quit driver
   - Close sessions

2. **Use appropriate waits**
   - Avoid hard-coded delays
   - Use explicit waits

3. **Make tests independent**
   - Don't rely on test execution order
   - Clean up after each test

4. **Keep page objects maintainable**
   - One purpose per method
   - Clear locator definitions
   - Reusable components

5. **Log everything**
   - Add descriptive console logs
   - Track test progress
   - Include timing information

## 📊 CI/CD Integration

To integrate with CI/CD pipelines:

```bash
# In your pipeline
npm install
npm run build
npm run test
# Report will be automatically generated
```

The Excel report can be archived or uploaded as a build artifact.

---

**Last Updated**: 2024
**Framework Version**: 1.0.0
**Appium Version**: 2.0+
**WebdriverIO Version**: 8.0+
