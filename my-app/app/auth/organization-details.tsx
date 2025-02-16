import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase/firebase.utils';

export default function OrganizationDetails() {
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [website, setWebsite] = useState('');

    const handleSubmit = async () => {
        if (!orgName || !orgDescription) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('No user found');

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                organizationName: orgName,
                organizationDescription: orgDescription,
                website: website || '',
                organizationPending: true
            });

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving organization details:', error);
            Alert.alert('Error', 'Failed to save organization details');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Organization Details</Text>
            <Text style={styles.subtitle}>
                Please provide information about your organization
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Organization Name"
                value={orgName}
                onChangeText={setOrgName}
            />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Organization Description"
                value={orgDescription}
                onChangeText={setOrgDescription}
                multiline
                numberOfLines={4}
            />

            <TextInput
                style={styles.input}
                placeholder="Website (Optional)"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
            />

            <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
            >
                <Text style={styles.submitButtonText}>Submit for Verification</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f7f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3D8D7A',
        marginTop: 40,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#3D8D7A',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
}); 