import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase/firebase.utils';

const TAGS = [
    'FundraiserHelper',
    'EventVolunteer',
    'Tutoring',
    'BeachCleanup',
    'TreePlanting',
    'DisasterRelief',
    'MentalHealthSupport',
    'PetRescue',
    'SocialMediaForChange'
];

export default function SelectTags() {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleContinue = async () => {
        if (selectedTags.length === 0) {
            alert('Please select at least one tag');
            return;
        }

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('No user found');

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                tags: selectedTags
            });

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving tags:', error);
            alert('Error saving your interests. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Interests</Text>
            <Text style={styles.subtitle}>
                Choose the volunteer activities that interest you
            </Text>

            <ScrollView style={styles.tagContainer}>
                {TAGS.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        style={[
                            styles.tag,
                            selectedTags.includes(tag) && styles.selectedTag
                        ]}
                        onPress={() => toggleTag(tag)}
                    >
                        <Text style={[
                            styles.tagText,
                            selectedTags.includes(tag) && styles.selectedTagText
                        ]}>
                            #{tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
            >
                <Text style={styles.continueButtonText}>Continue</Text>
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
    tagContainer: {
        flex: 1,
    },
    tag: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 25,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#3D8D7A',
    },
    selectedTag: {
        backgroundColor: '#3D8D7A',
    },
    tagText: {
        fontSize: 16,
        color: '#3D8D7A',
    },
    selectedTagText: {
        color: '#fff',
    },
    continueButton: {
        backgroundColor: '#3D8D7A',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
}); 