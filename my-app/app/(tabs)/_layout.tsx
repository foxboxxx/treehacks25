import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Fonts } from '@/constants/Fonts';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Abel_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3D8D7A',
        tabBarInactiveTintColor: '#A3D1C6',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          ...Fonts.abel,
          fontSize: 14,
          marginTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          // title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          // title: 'Vuzz',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hand.draw.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          // title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
