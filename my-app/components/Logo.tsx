import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';

const Logo = () => {
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Text style={styles.brandText}>Vuzz!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  brandText: {
    fontSize: 48,
    fontFamily: "Pacifico_400Regular",
    color: "#3D8D7A",  // Updated color
  },
});

export default Logo;

