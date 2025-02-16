import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from './Routes/Login/AuthContext';
import { Tabs } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
                title: "Sign In"
              }} 
            />
            <Stack.Screen 
              name="auth/signup" 
              options={{ 
                headerShown: true,
                title: "Sign Up",
                headerBackTitle: "Back to Sign In"
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GestureHandlerRootView>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
