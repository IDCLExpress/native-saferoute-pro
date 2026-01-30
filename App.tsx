import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Get web app URL from config or fallback
const WEB_APP_URL = Constants.expoConfig?.extra?.webAppUrl || 'https://www.saferouteapp.dev/';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const handleLoadEnd = async () => {
    setIsLoading(false);
    await SplashScreen.hideAsync();
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const injectedJavaScript = `
    (function() {
      document.body.classList.add('native-app');
      const style = document.createElement('style');
      style.textContent = \`
        .native-app .pwa-install-banner,
        .native-app .install-prompt,
        .native-app [data-pwa-install] {
          display: none !important;
        }
      \`;
      document.head.appendChild(style);
      document.body.style.overscrollBehavior = 'none';
      true;
    })();
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        allowsLinkPreview={false}
        bounces={false}
        pullToRefreshEnabled={true}
        onError={(e) => console.warn('WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.warn('HTTP error:', e.nativeEvent.statusCode)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
});