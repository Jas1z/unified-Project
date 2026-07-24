# Testing Architecture

## Overview

This document explains the architecture and design patterns used in the Appium testing framework.

## Design Patterns

### 1. Page Object Model (POM)

**Purpose**: Encapsulate page elements and interactions in dedicated classes

**Structure**:
```
BasePage (common functionality)
    ↓
HomeScreenPage, ExploreScreenPage, WebViewPage (specific pages)
```

**Benefits**:
- ✅ Easy maintenance - locators in one place
- ✅ Reusable methods across tests
- ✅ Clear separation of concerns
- ✅ Scalable for new pages

**Example**:
```typescript
// Page Object
class HomeScreenPage extends BasePage {
  private homeTabButton = 'android=new UiSelector()...';
  
  async clickHomeTab(): Promise<void> {
    await this.clickElement(this.homeTabButton);
  }
}

// Test using Page Object
async testHomeTab(): Promise<void> {
  await this.homeScreenPage.clickHomeTab();
  // ... assertions
}
```

### 2. Driver Manager Pattern

**Purpose**: Centralize Appium driver lifecycle management

**Responsibilities**:
- Initialize driver with capabilities
- Manage driver session
- Provide utility methods
- Handle cleanup

**Usage**:
```typescript
// Initialize
const driver = await DriverManager.initializeDriver();

// Use
const element = await DriverManager.getDriver().$('selector');

// Cleanup
await DriverManager.quitDriver();
```

### 3. Test Suite Pattern

**Purpose**: Organize related tests and manage results

**Structure**:
```
Test Class
  ├── testMethod1() ─→ Result
  ├── testMethod2() ─→ Result
  └── testMethod3() ─→ Result
  
getResults() → Array of Results
```

**Implementation**:
```typescript
class HomeScreenTest {
  async testAppLaunch(): Promise<void> {
    // Test logic
    // this.testResults.push({...})
  }
  
  getResults(): any[] {
    return this.testResults;
  }
}
```

### 4. Report Generation Pattern

**Purpose**: Convert test results to Excel report

**Flow**:
```
Test Results
    ↓
ExcelReportGenerator (aggregates)
    ↓
Workbook (creates)
    ├── Sheet 1: Test Results (data)
    └── Sheet 2: Device Info (metadata)
    ↓
Save to File
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  AppiumTestRunner                        │
│              (Main Test Orchestrator)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   HomeScreenTest  ExploreScreenTest  WebViewTest
        ↓                 ↓                 ↓
   HomeScreenPage  ExploreScreenPage  WebViewPage
        ↓                 ↓                 ↓
        └─────────────────┼─────────────────┘
                          ↓
                      BasePage
                (Common Methods & Waits)
                          ↓
                    DriverManager
              (Appium Driver Instance)
                          ↓
                  Appium Server
                   (4723 Port)
                          ↓
                    Android Device
```

## Class Relationships

### Inheritance
```
BasePage
├── HomeScreenPage
├── ExploreScreenPage
└── WebViewPage
```

### Composition
```
AppiumTestRunner
├── uses HomeScreenTest
├── uses ExploreScreenTest
├── uses WebViewTest
└── uses ExcelReportGenerator
```

## Data Flow

### Test Execution Flow
```
Start
  ↓
Initialize Driver
  ↓
Create Test Instances
  ↓
For Each Test:
  ├─ Execute test method
  ├─ Capture result
  └─ Store in results array
  ↓
Generate Excel Report
  ├─ Create workbook
  ├─ Add test results
  ├─ Add device info
  ├─ Add summary
  └─ Save to file
  ↓
Print Summary
  ↓
Quit Driver
  ↓
End
```

### Result Object Structure
```typescript
{
  testName: string;
  status: 'PASSED' | 'FAILED';
  duration: number;      // milliseconds
  error: string | null;  // error message if failed
}
```

## Configuration Management

```
Environment (.env)
     ↓
AppiumConfig (reads env)
     ↓
├── Appium Capabilities
├── Device Configuration
├── Test Settings
└── Report Settings
     ↓
Used by:
├── DriverManager
├── Tests
└── ReportGenerator
```

## Error Handling Strategy

### Try-Catch Pattern
```typescript
async method(): Promise<void> {
  try {
    // Execute
    // Assert
    // Record pass
  } catch (error) {
    // Record fail with error message
    // Take screenshot (optional)
    // Continue to next test
  }
}
```

### Benefits
- ✅ Prevents test suite from crashing
- ✅ Captures error details
- ✅ Continues remaining tests
- ✅ Accurate failure reporting

## Wait Strategies

### 1. Implicit Wait (Global)
```typescript
// Set once during initialization
await driver.setImplicitWaitTimeout(10000);
// Applied to all element interactions
```

### 2. Explicit Wait (Per Element)
```typescript
async waitForElement(selector: string, timeout: number): Promise<boolean> {
  try {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}
```

### 3. Hard Pause (When Necessary)
```typescript
async pause(milliseconds: number): Promise<void> {
  await this.driver.pause(milliseconds);
}
```

## Context Management (WebView)

### Context Types
```
NATIVE_APP   ← Native mobile app controls
WEBVIEW_*    ← Web content (loaded via WebView)
```

### Context Switching
```typescript
async switchToWebView(): Promise<void> {
  const contexts = await this.driver.getContexts();
  const webViewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
  if (webViewContext) {
    await this.driver.switchContext(webViewContext);
  }
}
```

## Excel Report Structure

### Sheet 1: Test Results
```
┌──────┬──────────────┬────────┬──────────┬───────────┬──────────┬──────┬──────┐
│ Test │   Test Name  │ Status │ Duration │   Error   │ Category │ Date │ Time │
├──────┼──────────────┼────────┼──────────┼───────────┼──────────┼──────┼──────┤
│  1   │ App Launch   │ PASSED │  2345ms  │     -     │   Home   │ ...  │ ...  │
│  2   │ Tab Nav      │ PASSED │  1234ms  │     -     │   Home   │ ...  │ ...  │
└──────┴──────────────┴────────┴──────────┴───────────┴──────────┴──────┴──────┘

Summary:
- Total: 15, Passed: 14, Failed: 1, Rate: 93.33%
```

### Sheet 2: Device Info
```
┌────────────────────────┬──────────────────────────┐
│ Device Name            │ emulator-5554            │
│ Platform               │ Android                  │
│ Platform Version       │ 14                       │
│ Automation Name        │ UiAutomator2             │
│ App Package            │ com.anonymous.ehrmobile │
│ Test Timeout           │ 30000ms                  │
│ Report Generated       │ 2024-01-15 10:30:45      │
└────────────────────────┴──────────────────────────┘
```

## Extensibility Points

### Adding New Test Suites
1. Create test class extending from base pattern
2. Implement test methods
3. Store results in testResults array
4. Register in AppiumTestRunner

### Adding New Page Objects
1. Create class extending BasePage
2. Define locators
3. Implement page-specific methods
4. Reuse in test classes

### Customizing Reports
1. Extend ExcelReportGenerator
2. Override setupWorksheet()
3. Add custom sheets/sections
4. Implement custom formatting

## Best Practices

### 1. Locator Selection Priority
```
1st: android=UiSelector() ← Most reliable for Android
2nd: xpath=//* ← Universal but slower
3rd: id/className ← When specific to app
```

### 2. Wait Handling
```
✓ Use explicit waits for elements
✓ Add reasonable timeouts (10-30 seconds)
✗ Avoid hard-coded sleep() calls
✗ Don't use very short timeouts
```

### 3. Test Independence
```
✓ Each test can run independently
✓ Setup/teardown within test
✓ No dependencies on other tests
✗ Don't rely on execution order
```

### 4. Error Messages
```
✓ Use descriptive test names
✓ Include actual/expected values
✓ Log test steps
✗ Generic error messages
```

## Performance Considerations

### Optimization Tips
- Reuse driver instance across tests
- Batch similar operations
- Minimize screenshot captures
- Use appropriate timeout values
- Close unnecessary contexts

### Expected Performance
```
- Single test: 2-5 seconds
- Full suite (15 tests): 30-60 seconds
- Report generation: 1-2 seconds
```

## Testing Levels

### Unit Tests (Page Objects)
- Test individual methods
- Mock driver interactions
- Not included in current suite

### Integration Tests (Current Suite)
- Test user workflows
- Real device interaction
- Full end-to-end scenarios

### System Tests
- Multiple apps interaction
- Network connectivity
- Not included in current suite

---

For more information, see README.md and QUICK_START.md
