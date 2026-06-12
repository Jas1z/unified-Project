import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

/**
 * WebView loads the Vite frontend (CareNexus web UI).
 * - Emulator: 10.0.2.2 = host PC
 * - Physical phone / Expo Go: same Wi‑Fi + your PC LAN IP (auto from Metro host)
 * - Override: set EXPO_PUBLIC_WEB_APP_URL in .env e.g. http://192.168.1.5:5173
 */
function resolveWebAppUrl(): string {
  const override = process.env.EXPO_PUBLIC_WEB_APP_URL;
  if (override) return override.replace(/\/$/, '');

  // Metro / Expo dev server host → same machine as Vite (5173)
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri;
  const lanHost = hostUri?.split(':')[0];
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
});
