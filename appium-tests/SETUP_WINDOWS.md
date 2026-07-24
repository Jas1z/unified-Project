# Setup Instructions - Windows

This guide helps you set up the Appium testing framework on Windows.

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/ (LTS version recommended)
- Run installer with default settings
- Verify installation:
  ```cmd
  node --version
  npm --version
  ```

### 2. Install Java JDK
- Download JDK 11 or higher from: https://www.oracle.com/java/technologies/downloads/
- Run installer and complete setup
- Set environment variable:
  ```cmd
  # Windows Key + X, Environment Variables
  # Add JAVA_HOME = C:\Program Files\Java\jdk-xx
  ```
- Verify:
  ```cmd
  java -version
  ```

### 3. Install Android SDK
- Download Android Studio from: https://developer.android.com/studio
- Run installer
- Open Android Studio and go to:
  - Tools > SDK Manager > SDK Platforms
  - Install "Android 13" or higher
- Set environment variable:
  ```cmd
  # Command Prompt (Admin)
  setx ANDROID_HOME "C:\Android\sdk"
  
  # Add to PATH
  setx PATH "%PATH%;C:\Android\sdk\platform-tools;C:\Android\sdk\tools"
  ```
- Verify:
  ```cmd
  adb version
  ```

### 4. Install Appium Server
```cmd
npm install -g appium
npm install -g appium-doctor

# Verify installation
appium --version

# Check for missing dependencies
appium-doctor --android
```

### 5. Create Android Virtual Device (Emulator)
```cmd
# Open Android Studio > AVD Manager
# Or use command line:
$ANDROID_HOME\tools\bin\avdmanager create avd -n "test_emulator" -k "system-images;android;33;google_apis"

# Start emulator
emulator -avd test_emulator
```

## Project Setup

### 1. Clone/Copy Project
```cmd
cd d:\program\pdd\appium-tests
```

### 2. Install Dependencies
```cmd
npm install
```

### 3. Configure Environment
```cmd
copy .env.example .env
# Edit .env with your settings
```

### 4. Build the Android App
From the main project directory:
```cmd
cd ..\ehr-mobile
npm install
npm run build:android
```

## Running Tests

### Terminal 1: Start Appium Server
```cmd
appium
# Output: Appium v2.x.x listening on 127.0.0.1:4723
```

### Terminal 2: Start Emulator
```cmd
emulator -avd test_emulator
# Wait for emulator to fully load
```

### Terminal 3: Run Tests
```cmd
cd appium-tests
npm run test
```

### Terminal 4: Monitor Device (Optional)
```cmd
adb logcat
```

## Useful Windows Commands

```cmd
# Check Java version
java -version

# Check Android SDK
echo %ANDROID_HOME%

# List Android devices
adb devices

# Install APK
adb install -r path\to\app.apk

# Clear app data
adb shell pm clear com.anonymous.ehrmobile

# View device logs
adb logcat

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png .

# Open device shell
adb shell

# Get device properties
adb shell getprop
```

## Environment Variables Setup (Windows)

### Method 1: Using setx (Command Prompt - Admin)
```cmd
# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Java\jdk-xx"

# Set ANDROID_HOME
setx ANDROID_HOME "C:\Android\sdk"

# Add to PATH
setx PATH "%PATH%;C:\Android\sdk\platform-tools;C:\Android\sdk\tools"

# Verify
echo %JAVA_HOME%
echo %ANDROID_HOME%
```

### Method 2: Using GUI
1. Press `Windows Key + X`
2. Select "System"
3. Click "Advanced system settings"
4. Click "Environment Variables"
5. Add new variables:
   - `JAVA_HOME`: `C:\Program Files\Java\jdk-xx`
   - `ANDROID_HOME`: `C:\Android\sdk`
6. Edit `PATH` and add:
   - `C:\Android\sdk\platform-tools`
   - `C:\Android\sdk\tools`

## Troubleshooting

### Appium Server won't start
```cmd
# Kill any process on port 4723
netstat -ano | findstr :4723
taskkill /PID <PID> /F

# Try different port
# Edit .env: APPIUM_PORT=4724
appium --port 4724
```

### Emulator issues
```cmd
# List available AVDs
emulator -list-avds

# Start specific AVD with options
emulator -avd test_emulator -memory 2048

# Check emulator status
adb devices

# Restart emulator
adb reboot
```

### ADB connection issues
```cmd
# Restart ADB server
adb kill-server
adb start-server

# Check connections
adb devices

# Connect to emulator
adb connect 127.0.0.1:5555
```

### App not installing
```cmd
# Check if app is already installed
adb shell pm list packages | findstr ehrmobile

# Uninstall previous version
adb uninstall com.anonymous.ehrmobile

# Install new APK
adb install -r path\to\app-release.apk
```

### Missing SDK platforms
```cmd
# Accept Android SDK licenses
android update sdk --no-ui --all --accept-licenses

# Or use Android Studio SDK Manager
# Tools > SDK Manager > Install latest platforms
```

## Performance Tips

1. **Allocate more RAM to Emulator**
   - Edit `.android\avd\test_emulator.avd\config.ini`
   - Set `hw.ramSize=4096`

2. **Enable Hardware Acceleration**
   - Update .env: `HARDWARE_ACCELERATION=true`

3. **Use GPU for Emulator**
   - Launch with: `emulator -avd test_emulator -gpu on`

4. **Reduce Test Timeout**
   - For faster devices, reduce `TEST_TIMEOUT` in .env

## Next Steps

1. ✅ Install all prerequisites
2. ✅ Set up Android SDK and emulator
3. ✅ Install Appium
4. ✅ Clone this project
5. ✅ Run `npm install`
6. ✅ Configure .env
7. ✅ Start Appium and emulator
8. ✅ Run tests: `npm run test`
9. ✅ Check Excel report

## Useful Resources

- Appium Documentation: https://appium.io/docs/
- WebdriverIO Docs: https://webdriver.io/
- Android Studio Docs: https://developer.android.com/studio
- Java Documentation: https://docs.oracle.com/

---

For more help, refer to README.md or QUICK_START.md
