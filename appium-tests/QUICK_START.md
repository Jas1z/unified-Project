# EHR Mobile Application - Appium Testing Framework

## Quick Start Guide

### 1. Prerequisites Setup
```bash
# Install Appium globally
npm install -g appium

# Install Android SDK (if not already installed)
# Download from: https://developer.android.com/studio

# Set Android SDK path
setx ANDROID_HOME "C:\Android\sdk"
```

### 2. Start Services
```bash
# Terminal 1: Start Appium Server
appium

# Terminal 2: Start Android Emulator
emulator -avd "emulator_name"
```

### 3. Setup and Run Tests
```bash
# Terminal 3: Navigate to appium-tests folder
cd appium-tests

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Run all tests
npm run test
```

### 4. View Results
```
✅ Excel report generated in: reports/ehr-mobile-test-report-YYYY-MM-DD-HH-mm-ss.xlsx
```

## Project Organization

```
appium-tests/
│
├── 📁 config/
│   └── appiumConfig.ts ............. Appium configuration & capabilities
│
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── BasePage.ts ............ Common page functions (click, type, wait)
│   │   ├── HomeScreenPage.ts ...... Home screen tests
│   │   ├── ExploreScreenPage.ts ... Explore screen tests
│   │   └── WebViewPage.ts ........ WebView interactions
│   │
│   ├── 📁 tests/
│   │   ├── homeScreenTest.ts ....... 5 home screen E2E tests
│   │   ├── exploreScreenTest.ts ... 5 explore screen E2E tests
│   │   └── webviewTest.ts ......... 5 WebView E2E tests
│   │
│   ├── 📁 utils/
│   │   ├── driverManager.ts ....... Appium driver lifecycle management
│   │   └── reportGenerator.ts .... Excel report generation (ExcelJS)
│   │
│   └── index.ts .................. Main test runner (orchestrates all tests)
│
├── 📁 reports/
│   └── *.xlsx ..................... Generated test reports
│
├── package.json ................... Dependencies (appium, webdriverio, exceljs)
├── tsconfig.json .................. TypeScript settings
├── .env.example ................... Configuration template
├── .gitignore ..................... Git ignore rules
└── README.md ...................... Full documentation
```

## Test Suites (15 Total Tests)

### 🏠 Home Screen (5 tests)
1. App launch & home screen load
2. Home tab navigation
3. Home screen scroll functionality
4. Content loading
5. UI responsiveness

### 🔍 Explore Screen (5 tests)
1. Explore screen load
2. Tab navigation
3. List items display
4. List scrolling
5. Content verification

### 🌐 WebView (5 tests)
1. WebView load
2. Context switching
3. Responsiveness
4. Page title
5. JavaScript execution

## Key Features

✅ **Page Object Model** - Clean, maintainable test structure
✅ **15 E2E Tests** - Comprehensive coverage
✅ **Excel Reports** - Detailed test results with statistics
✅ **Device Info** - Device configuration logged
✅ **Screenshot Capture** - Save on failure
✅ **Color-coded Results** - Green/red status visualization
✅ **TypeScript** - Type-safe code
✅ **Error Handling** - Comprehensive try-catch blocks
✅ **Logging** - Detailed console output

## NPM Scripts

```bash
npm run test        # Run all tests
npm run test:home   # Home screen tests only
npm run test:explore # Explore screen tests only
npm run test:webview # WebView tests only
npm run build       # Compile TypeScript
npm run clean       # Remove build artifacts
```

## Configuration (.env)

```env
# Appium Server
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723

# Android Device
ANDROID_DEVICE_NAME=emulator-5554
ANDROID_PLATFORM_VERSION=14
ANDROID_APP_PACKAGE=com.anonymous.ehrmobile
ANDROID_APP_ACTIVITY=.MainActivity

# Test Timeouts
TEST_TIMEOUT=30000
IMPLICIT_WAIT=10000

# Reports
REPORT_OUTPUT_PATH=./reports
REPORT_FILENAME=ehr-mobile-test-report
```

## Excel Report Structure

### Sheet 1: Test Results
| Test # | Test Name | Status | Duration | Error | Category | Date | Time |
|--------|-----------|--------|----------|-------|----------|------|------|
| 1 | App Launch | PASSED | 2345ms | - | Home Screen | ... | ... |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Summary Section:**
- Total Tests: 15
- Passed: 14
- Failed: 1
- Success Rate: 93.33%
- Total Duration: 45,234ms

### Sheet 2: Device Info
- Device Name
- Platform & Version
- Automation Engine
- App Package/Activity
- Configuration details
- Report timestamp

## Common Commands

```bash
# Install dependencies
npm install

# Build/compile TypeScript
npm run build

# Run tests
npm run test

# Start Appium
appium

# Start emulator
emulator -avd emulator_name

# List Android devices
adb devices

# Install APK
adb install app-release.apk

# View device logs
adb logcat
```

## Page Object Methods

### BasePage (All Pages Inherit)
```typescript
await page.clickElement(selector)
await page.inputText(selector, text)
await page.getText(selector)
await page.waitForElement(selector)
await page.swipe(startX, startY, endX, endY)
await page.takeScreenshot(filename)
await page.goBack()
await page.pause(milliseconds)
```

### HomeScreenPage
```typescript
await page.verifyHomeScreenLoaded()
await page.clickHomeTab()
await page.scrollDown()
await page.scrollUp()
await page.getHomeScreenContent()
```

### ExploreScreenPage
```typescript
await page.verifyExploreScreenLoaded()
await page.clickExploreTab()
await page.searchContent(query)
await page.clearSearch()
await page.scrollThroughList()
```

### WebViewPage
```typescript
await page.verifyWebViewLoaded()
await page.switchToWebView()
await page.switchToNative()
await page.executeScript(script)
await page.getAvailableContexts()
```

## Troubleshooting

**Q: "Cannot connect to Appium Server"**
A: Make sure Appium is running on the configured host:port
```bash
appium --host 127.0.0.1 --port 4723
```

**Q: "Device not found"**
A: Ensure emulator/device is running
```bash
adb devices  # Should list your device
```

**Q: "Element not found"**
A: Verify locators and increase wait timeout in .env

**Q: "WebView context not found"**
A: Ensure WebView is loaded before switching contexts

## Next Steps

1. ✅ Run tests: `npm run test`
2. ✅ Check Excel report in `reports/` folder
3. ✅ Review results and success rate
4. ✅ Integrate into CI/CD pipeline
5. ✅ Extend tests for new features

---

For detailed documentation, see **README.md**
