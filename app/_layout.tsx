import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { supabase } from '../backend/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if fonts are loaded before hiding splash screen
    if (loaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [loaded]);

  useEffect(() => {
    if (isReady) {
      // Check authentication status only after app is mounted
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // User is logged in, redirect to home
          router.replace('/(tabs)');
        } else {
          // User is not logged in, redirect to login
          router.replace('/auth/login');
        }
      };
      checkAuth();
    }
  }, [isReady]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Disable all headers globally
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
