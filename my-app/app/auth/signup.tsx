import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useAuth } from '../Routes/Login/AuthContext';
import LocationPicker from '@/components/LocationPicker';

// Add interface for location data
interface LocationData {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}

export default function SignUp() {
    const scrollViewRef = useRef<ScrollView>(null);
    const { 
        email, setEmail, 
        password, setPassword,
        username, setUsername,
        firstName, setFirstName,
        lastName, setLastName,
        age, setAge,
        city, setCity,
        state, setState,
        latitude, setLatitude,
        longitude, setLongitude,
        isOrganizer, setIsOrganizer,
        handleSignUp 
    } = useAuth();
    
    const handleFocus = (y: number) => {
        scrollViewRef.current?.scrollTo({
            y: y,
            animated: true
        });
    };
    
    const handleLocationSelect = (locationData: LocationData) => {
        setCity(locationData.city);
        setState(locationData.state);
        setLatitude(locationData.latitude);
        setLongitude(locationData.longitude);
    };
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.logo}>Vuzz</Text>
                    <Text style={styles.title}>Create Account</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#666"
                        value={firstName}
                        onChangeText={setFirstName}
                        onFocus={() => handleFocus(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#666"
                        value={lastName}
                        onChangeText={setLastName}
                        onFocus={() => handleFocus(50)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Age"
                        placeholderTextColor="#666"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        onFocus={() => handleFocus(100)}
                    />
                    <View style={styles.locationSection}>
                        <Text style={styles.locationLabel}>Location</Text>
                        <LocationPicker 
                            onLocationSelect={handleLocationSelect}
                            initialLocation={{ 
                                city: city, 
                                state: state,
                                latitude: 0, // Add default latitude
                                longitude: 0 // Add default longitude
                            }}
                        />
                        {city && state && (
                            <Text style={styles.selectedLocation}>
                                Selected: {city}, {state}
                            </Text>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => handleFocus(250)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#666"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onFocus={() => handleFocus(300)}
                    />
                    
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity 
                            style={[styles.checkbox, isOrganizer && styles.checkboxChecked]}
                            onPress={() => setIsOrganizer(!isOrganizer)}
                        >
                            {isOrganizer && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                        <Text style={styles.checkboxLabel}>I am an organization/sponsor</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={styles.dismissKeyboard}
                onPress={Keyboard.dismiss}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f7f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 30,
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: 'white',
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    dismissKeyboard: {
        height: 30,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        marginHorizontal: '10%',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#3D8D7A',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3D8D7A',
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
    },
    locationSection: {
        width: '80%',
        marginBottom: 15,
    },
    locationLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    selectedLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
}); 