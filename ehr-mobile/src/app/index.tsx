import { Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

/**
 * WebView loads the Vite frontend (CareNexus web UI).
 * - Release APK: EXPO_PUBLIC_WEB_APP_URL in .env → app.config.js extra.webAppUrl
 * - Emulator: 10.0.2.2 = host PC
 * - Expo Go: same Wi‑Fi + Metro host, or .env override
 */
function resolveWebAppUrl(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.webAppUrl as string | undefined;
  const override = fromExtra || process.env.EXPO_PUBLIC_WEB_APP_URL;
  if (override?.startsWith('http')) {
    return override.replace(/\/$/, '');
  }

  // Metro / Expo dev server host → same machine as Vite (5173)
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri;
  const match = hostUri?.match(/(?:exp|http):\/\/([^:/]+)/);
  const lanHost = match?.[1];
  if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
    return `http://${lanHost}:5173`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5173';
  }
  return 'http://localhost:5173';
}

const WEB_APP_URL = resolveWebAppUrl();

const INJECTED_VIEWPORT = `
  (function() {
    var meta = document.querySelector('meta[name=viewport]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.webkitOverflowScrolling = 'touch';
  })();
  true;
`;

export default function HomeScreen() {
  if (!WEB_APP_URL) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Web app URL not configured</Text>
          <Text style={styles.errorBody}>
            Set EXPO_PUBLIC_WEB_APP_URL in ehr-mobile/.env to your laptop Wi‑Fi IP, then rebuild
            the APK. Example: http://10.145.200.174:5173
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <WebView
        source={{ uri: WEB_APP_URL }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        injectedJavaScriptBeforeContentLoaded={INJECTED_VIEWPORT}
        style={styles.webview}
        textZoom={100}
        scalesPageToFit={false}
        onError={(e) => console.warn('WebView error', e.nativeEvent)}
        onHttpError={(e) => console.warn('WebView HTTP error', e.nativeEvent.statusCode, WEB_APP_URL)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  webview: {
    flex: 1,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0f172a',
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
});
