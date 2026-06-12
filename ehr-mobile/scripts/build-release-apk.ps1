# Build installable release APK for physical Android phones (college demo).
# Usage: .\scripts\build-release-apk.ps1
# Optional: .\scripts\build-release-apk.ps1 -LanIp 192.168.1.42

param(
    [string]$LanIp = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

if ($LanIp) {
    @"
EXPO_PUBLIC_WEB_APP_URL=http://${LanIp}:5173
"@ | Set-Content -Path ".env" -Encoding utf8NoBOM
    Write-Host "Wrote .env with LAN IP $LanIp"
} elseif (-not (Test-Path ".env")) {
    Write-Warning "No .env found. Create .env with EXPO_PUBLIC_WEB_APP_URL=http://YOUR_IP:5173"
}

$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
if (-not (Test-Path $env:ANDROID_HOME)) {
    throw "Android SDK not found at $env:ANDROID_HOME. Install Android Studio SDK."
}

Write-Host "Building release APK (arm64 + armeabi for phones)..."
Set-Location android
& .\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$apk = Get-Item ".\app\build\outputs\apk\release\app-release.apk"
Write-Host ""
Write-Host "APK: $($apk.FullName)"
Write-Host "Size: $([math]::Round($apk.Length / 1MB, 2)) MB"
Write-Host "Install: adb install -r `"$($apk.FullName)`""
