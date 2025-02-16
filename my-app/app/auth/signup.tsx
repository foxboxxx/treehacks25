import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useAuth } from '../Routes/Login/AuthContext';

export default function SignUp() {
    const scrollViewRef = useRef<ScrollView>(null);
    const { 
        email, setEmail, 
        password, setPassword,
        firstName, setFirstName,
        lastName, setLastName,
        age, setAge,
        city, setCity,
        state, setState,
        handleSignUp 
    } = useAuth();
    
    const handleFocus = (y: number) => {
        scrollViewRef.current?.scrollTo({
            y: y,
            animated: true
        });
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
                    <Text style={styles.title}>Create Account</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#afafaf"
                        value={firstName}
                        onChangeText={setFirstName}
                        onFocus={() => handleFocus(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#afafaf"
                        value={lastName}
                        onChangeText={setLastName}
                        onFocus={() => handleFocus(50)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Age"
                        placeholderTextColor="#afafaf"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        onFocus={() => handleFocus(100)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="#afafaf"
                        value={city}
                        onChangeText={setCity}
                        onFocus={() => handleFocus(150)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="State"
                        placeholderTextColor="#afafaf"
                        value={state}
                        onChangeText={setState}
                        onFocus={() => handleFocus(200)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#afafaf"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => handleFocus(250)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#afafaf"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onFocus={() => handleFocus(300)}
                    />
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
        backgroundColor: '#fff',
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dismissKeyboard: {
        height: 30,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 