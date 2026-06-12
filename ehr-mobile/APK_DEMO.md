# EHR Mobile — Release APK (College Demo)

## Build type

**Expo Prebuild** (Expo SDK 56 + native `android/` folder). Release APK built with Gradle:

```powershell
cd ehr-mobile\android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleRelease "-PreactNativeArchitectures=arm64-v8a,armeabi-v7a"
```

Or: `.\scripts\build-release-apk.ps1`

## APK location

```
ehr-mobile\android\app\build\outputs\apk\release\app-release.apk
```

## Before demo day

1. **Same Wi‑Fi** — Phone and laptop on one network.
2. **Docker on laptop** — From `Unified-Secure-Patient-Record-System`:
   ```powershell
   docker compose up -d
   ```
   Frontend: **5173**, Backend: **8000**.
3. **Windows Firewall** — Allow inbound TCP **5173** and **8000** on Private network.
4. **Find laptop IP** — `ipconfig` → Wi‑Fi **IPv4** (e.g. `10.24.165.174`).
5. **Update `.env` and rebuild APK** if IP changes:
   ```
   EXPO_PUBLIC_WEB_APP_URL=http://YOUR_LAPTOP_IP:5173
   ```
   Then run `.\scripts\build-release-apk.ps1` again.

## URLs the app uses

| Layer | Config | Demo URL (example) |
|--------|--------|---------------------|
| WebView (shell) | `ehr-mobile/.env` → `EXPO_PUBLIC_WEB_APP_URL` | `http://10.24.165.174:5173` |
| API (inside web UI) | Auto: same host as page, port **8000** | `http://10.24.165.174:8000` |

Test in phone browser first: `http://YOUR_IP:5173` — if that loads, the APK will work.

## Install on phone

1. Enable **Install unknown apps** for Files/Chrome.
2. Copy `app-release.apk` to the phone (USB, Drive, etc.).
3. Open the APK and install.

**ADB (USB debugging):**

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r "d:\program\pdd\ehr-mobile\android\app\build\outputs\apk\release\app-release.apk"
```

## Notes

- Release APK is signed with the **debug keystore** (fine for class demo, not for Play Store).
- Cleartext HTTP is enabled so the app can load `http://` LAN URLs.
- Emulator-only URL `10.0.2.2` is **not** used when `EXPO_PUBLIC_WEB_APP_URL` is set in `.env`.
