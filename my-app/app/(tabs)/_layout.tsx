import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { CgProfile } from "react-icons/cg";
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
          fontSize: 14,
          marginTop: 5,
        },
      }}>
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Vuzz',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? 'hand.draw.fill' : 'hand.draw'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? 'message.fill' : 'message'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? 'person.fill' : 'person'} color={color} />,
        }}
      />
    </Tabs>
  );
}
