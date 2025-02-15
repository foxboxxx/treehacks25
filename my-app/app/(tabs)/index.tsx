import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import { Fonts } from '@/constants/Fonts';

export default function Homescreen() {
  return (
    <View style={styles.container}>
      {/* <Text>(INSERT NAME HERE))</Text>
      <Button 
      title="CLICK" 
      onPress={() => console.log('Button Pressed!')} 
      style={{ backgroundColor: '#B3D8A8', padding: 10, borderRadius: 20 }} 
      textStyle={{ ...Fonts.abel, fontSize: 20, color: 'black' }} 
      /> */}
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
