# Appium Locator Strategies & Helpers

Reference guide for finding and interacting with elements in your Appium tests.

## Android Locator Strategies

### 1. UiSelector (Recommended for Android)

**Basic Syntax**:
```typescript
const locator = 'android=new UiSelector().selector_name("value")';
```

**Common Selectors**:
```typescript
// By text
'android=new UiSelector().text("Button Text")'
'android=new UiSelector().textContains("partial")'
'android=new UiSelector().textMatches("^regex$")'

// By resource ID
'android=new UiSelector().resourceId("com.app:id/button_id")'

// By class name
'android=new UiSelector().className("android.widget.Button")'

// By content description
'android=new UiSelector().contentDescription("Submit")'
'android=new UiSelector().descriptionMatches(".*login.*")'

// By package name
'android=new UiSelector().packageName("com.android.launcher")'

// Combinations
'android=new UiSelector().text("Login").className("android.widget.Button")'
```

### 2. XPath

**Basic Syntax**:
```typescript
const locator = 'xpath=//*[@attribute="value"]';
```

**Common XPath Examples**:
```typescript
// By text
'xpath=//*[@text="Click Here"]'
'xpath=//android.widget.Button[@text="Submit"]'
'xpath=//*[contains(@text, "partial")]'

// By resource ID
'xpath=//*[@resource-id="com.app:id/button"]'

// By class
'xpath=//android.widget.Button'

// By content description
'xpath=//*[@content-desc="Login"]'

// Parent-child relationships
'xpath=//android.widget.LinearLayout/android.widget.Button'

// Sibling
'xpath=//android.widget.TextView[@text="Email"]/following-sibling::android.widget.EditText'

// Multiple conditions
'xpath=//*[@text="Login" and @class="android.widget.Button"]'
```

### 3. ID Selector

```typescript
// Simple ID (when available)
'id=com.app:id/button_login'
```

### 4. Class Name

```typescript
'className=android.widget.Button'
```

## Helper Methods

### Common Element Interactions

```typescript
// Click
await page.clickElement('android=new UiSelector().text("Button")');

// Input text
await page.inputText('android=new UiSelector().resourceId("*.edit_text")', 'text value');

// Get text
const text = await page.getText('android=new UiSelector().text("Label")');

// Wait for element
const exists = await page.waitForElement('selector', 5000);

// Check visibility
const visible = await page.isElementDisplayed('selector');

// Clear text
await page.clearText('selector');

// Get attribute
const attr = await page.getElementAttribute('selector', 'resource-id');

// Swipe
await page.swipe(100, 200, 100, 500, 1000);  // Swipe up

// Pause
await page.pause(2000);  // Wait 2 seconds

// Go back
await page.goBack();

// Take screenshot
await page.takeScreenshot('test_screenshot.png');
```

## Common Element Patterns

### Button Click
```typescript
// By text
'android=new UiSelector().text("Login")'

// By resource ID
'android=new UiSelector().resourceId("com.app:id/login_button")'

// By class
'android=new UiSelector().className("android.widget.Button")'
```

### Text Input
```typescript
// EditText
'android=new UiSelector().resourceId("com.app:id/username")'

// By description
'android=new UiSelector().description("Enter username")'

// By hint text
'android=new UiSelector().resourceIdMatches(".*search.*")'
```

### List Items
```typescript
// First item
'android=new UiSelector().className("android.widget.ListView").childSelector(new UiSelector().text("Item"))'

// Specific index
'android=new UiSelector().className("android.widget.ListView").getFromIndex(0)'

// All items
'android=new UiSelector().className("android.view.View").resourceIdMatches(".*item.*")'
```

### Tab Navigation
```typescript
// Tab bar
'android=new UiSelector().className("android.widget.TabWidget")'

// Specific tab
'android=new UiSelector().text("Home").className("android.widget.TabWidget.TabSpec")'

// Or by description
'android=new UiSelector().contentDescription("Home")'
```

### Navigation Drawer
```typescript
// Open drawer
'android=new UiSelector().description("Open navigation drawer")'

// Menu items in drawer
'android=new UiSelector().resourceId("com.app:id/navigation_menu").childSelector(new UiSelector().text("Profile"))'
```

## Advanced Locator Techniques

### Multiple Conditions (AND logic)
```typescript
'android=new UiSelector().text("Save").className("android.widget.Button").enabled(true)'
```

### Index-based Selection
```typescript
// First button
'android=new UiSelector().className("android.widget.Button").instance(0)'

// Second button
'android=new UiSelector().className("android.widget.Button").instance(1)'
```

### Parent-based Selection
```typescript
'android=new UiSelector().resourceId("com.app:id/parent").childSelector(new UiSelector().text("Child"))'
```

### Scrollable Container
```typescript
// Scroll to item
'android=new UiSelector().scrollable(true).resourceId("com.app:id/list")'

// Item in scrollable
'android=new UiSelector().scrollable(true).childSelector(new UiSelector().text("Item Text"))'
```

## Finding Locators

### Using Android Device Monitor

```bash
# 1. Connect device
adb devices

# 2. Open device monitor
android-monitor

# 3. Click "Dump View Hierarchy" button
# 4. Inspect XML structure for IDs, classes, text
```

### Using adb shell

```bash
# Get XML dump to file
adb shell uiautomator dump /sdcard/uidump.xml
adb pull /sdcard/uidump.xml

# View in text editor
type uidump.xml
```

### Using UI Automator Viewer

```bash
# Open viewer
%ANDROID_HOME%\tools\uiautomatorviewer.bat

# Screenshot and inspect elements
# View resource IDs and text content
```

### Using Appium Inspector

```bash
# Start Appium Inspector
# Connect to running Appium server
# Tap elements to see locators
# Copy recommended locators
```

## Test Helper Functions

### Wait Helpers
```typescript
/**
 * Wait for element with custom timeout
 */
async waitForElementCustom(selector: string, timeout: number = 10000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const element = await this.driver.$(selector);
      if (await element.isDisplayed()) return true;
    } catch {}
    await this.pause(100);
  }
  return false;
}

/**
 * Wait for element then click
 */
async waitAndClick(selector: string): Promise<void> {
  await this.waitForElement(selector);
  await this.clickElement(selector);
}

/**
 * Wait for element then input text
 */
async waitAndInput(selector: string, text: string): Promise<void> {
  await this.waitForElement(selector);
  await this.inputText(selector, text);
}
```

### Assertion Helpers
```typescript
/**
 * Assert element is visible
 */
async assertElementVisible(selector: string): Promise<void> {
  const isVisible = await this.isElementDisplayed(selector);
  if (!isVisible) throw new Error(`Element not visible: ${selector}`);
}

/**
 * Assert element text matches
 */
async assertTextMatch(selector: string, expectedText: string): Promise<void> {
  const actualText = await this.getText(selector);
  if (actualText !== expectedText) {
    throw new Error(`Expected "${expectedText}" but got "${actualText}"`);
  }
}

/**
 * Assert element contains text
 */
async assertTextContains(selector: string, expectedText: string): Promise<void> {
  const actualText = await this.getText(selector);
  if (!actualText.includes(expectedText)) {
    throw new Error(`"${actualText}" does not contain "${expectedText}"`);
  }
}
```

### Gesture Helpers
```typescript
/**
 * Swipe up
 */
async swipeUp(steps: number = 5): Promise<void> {
  const { width, height } = await this.driver.getWindowSize();
  await this.swipe(width / 2, height * 0.8, width / 2, height * 0.2);
}

/**
 * Swipe down
 */
async swipeDown(steps: number = 5): Promise<void> {
  const { width, height } = await this.driver.getWindowSize();
  await this.swipe(width / 2, height * 0.2, width / 2, height * 0.8);
}

/**
 * Swipe left
 */
async swipeLeft(): Promise<void> {
  const { width, height } = await this.driver.getWindowSize();
  await this.swipe(width * 0.8, height / 2, width * 0.2, height / 2);
}

/**
 * Swipe right
 */
async swipeRight(): Promise<void> {
  const { width, height } = await this.driver.getWindowSize();
  await this.swipe(width * 0.2, height / 2, width * 0.8, height / 2);
}

/**
 * Long press element
 */
async longPress(selector: string, duration: number = 2000): Promise<void> {
  const element = await this.driver.$(selector);
  await element.touchAction([
    { action: 'press', element },
    { action: 'wait', ms: duration },
    { action: 'release' }
  ]);
}

/**
 * Double tap
 */
async doubleTap(selector: string): Promise<void> {
  const element = await this.driver.$(selector);
  await element.doubleClick();
}
```

### Common Patterns
```typescript
/**
 * Fill login form
 */
async fillLoginForm(username: string, password: string): Promise<void> {
  await this.waitAndInput('android=new UiSelector().resourceId("*.username")', username);
  await this.waitAndInput('android=new UiSelector().resourceId("*.password")', password);
  await this.waitAndClick('android=new UiSelector().text("Login")');
}

/**
 * Navigate to tab
 */
async navigateToTab(tabName: string): Promise<void> {
  await this.clickElement(`android=new UiSelector().contentDescription("${tabName}")`);
  await this.pause(1000);
}

/**
 * Scroll to element
 */
async scrollToElement(selector: string): Promise<void> {
  const scrollable = 'android=new UiSelector().scrollable(true)';
  await this.driver.$$(scrollable)[0].scrollIntoView();
  await this.waitForElement(selector);
}

/**
 * Select from dropdown
 */
async selectDropdownItem(dropdownSelector: string, itemText: string): Promise<void> {
  await this.clickElement(dropdownSelector);
  await this.pause(500);
  await this.clickElement(`android=new UiSelector().text("${itemText}")`);
}
```

## Debugging Tips

### Log All Elements of a Type
```typescript
async logAllButtons(): Promise<void> {
  const buttons = await this.driver.$$('android=new UiSelector().className("android.widget.Button")');
  for (const button of buttons) {
    const text = await button.getText();
    console.log(`Button: ${text}`);
  }
}
```

### Get Full Page Source
```typescript
async getPageStructure(): Promise<void> {
  const pageSource = await this.driver.getPageSource();
  console.log(pageSource);
  
  // Save to file for analysis
  fs.writeFileSync('page_structure.xml', pageSource);
}
```

### Find Element by Partial Text
```typescript
async findByPartialText(text: string): Promise<string> {
  const element = await this.driver.$(
    `android=new UiSelector().textContains("${text}")`
  );
  return element ? element.getText() : 'Not found';
}
```

## Best Practices for Locators

1. **Prefer resource ID** - Most reliable and fastest
   ```typescript
   'android=new UiSelector().resourceId("com.app:id/button")'
   ```

2. **Use content description** for navigation items
   ```typescript
   'android=new UiSelector().contentDescription("Home")'
   ```

3. **Use text** only for user-visible stable text
   ```typescript
   'android=new UiSelector().text("Login")'
   ```

4. **Avoid class names alone** - Too generic
   ```typescript
   // ❌ Don't use alone
   'android=new UiSelector().className("android.widget.Button")'
   
   // ✅ Combine with other attributes
   'android=new UiSelector().className("android.widget.Button").resourceId("com.app:id/login")'
   ```

5. **Use XPath for complex structures**
   ```typescript
   'xpath=//android.widget.ListView//android.widget.TextView[@text="Item 1"]/following-sibling::android.widget.Button'
   ```

## Adding Locators to Your Page Objects

```typescript
export class LoginPage extends BasePage {
  // Locators
  private usernameField = 'android=new UiSelector().resourceId("com.app:id/username")';
  private passwordField = 'android=new UiSelector().resourceId("com.app:id/password")';
  private loginButton = 'android=new UiSelector().text("Login")';
  private errorMessage = 'android=new UiSelector().resourceId("com.app:id/error_message")';
  
  // Methods using locators
  async login(username: string, password: string): Promise<void> {
    await this.inputText(this.usernameField, username);
    await this.inputText(this.passwordField, password);
    await this.clickElement(this.loginButton);
  }
  
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }
}
```

---

Use this guide as reference when creating or updating your tests!
