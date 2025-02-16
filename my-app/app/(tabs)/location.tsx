import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LocationPicker from '../../components/LocationPicker';

export default function LocationPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Picker</Text>
            <LocationPicker />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
}); 