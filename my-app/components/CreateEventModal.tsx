import React, { useState, useRef } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    Image,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard
} from 'react-native';
import { createEvent } from '../app/utils/firebase/firebase.utils';

interface CreateEventModalProps {
    visible: boolean;
    onClose: () => void;
    onEventCreated: () => void;
}

export default function CreateEventModal({ visible, onClose, onEventCreated }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSubmit = async () => {
        try {
            if (!imageUrl.startsWith('http')) {
                alert('Please enter a valid image URL');
                return;
            }

            await createEvent({
                title,
                description,
                date,
                time,
                location,
                imageUrl,
            });
            
            onEventCreated();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setTime('');
            setLocation('');
            setImageUrl('');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        }
    };

    const handleFocus = (y: number) => {
        scrollViewRef.current?.scrollTo({
            y: y,
            animated: true
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Create New Event</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Image URL (e.g., https://example.com/image.jpg)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            placeholderTextColor="#afafaf"
                            autoCapitalize="none"
                            onFocus={() => handleFocus(0)}
                        />
                        
                        {imageUrl && (
                            <View style={styles.imagePreview}>
                                <Image 
                                    source={{ uri: imageUrl }} 
                                    style={styles.previewImage}
                                    onError={() => {
                                        alert('Invalid image URL');
                                        setImageUrl('');
                                    }}
                                />
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Event Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#afafaf"
                            onFocus={() => handleFocus(250)}
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            placeholderTextColor="#afafaf"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Date (MM/DD/YYYY)"
                            value={date}
                            onChangeText={setDate}
                            placeholderTextColor="#afafaf"
                            onFocus={() => handleFocus(300)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Time"
                            value={time}
                            onChangeText={setTime}
                            placeholderTextColor="#afafaf"
                            onFocus={() => handleFocus(350)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Location"
                            value={location}
                            onChangeText={setLocation}
                            placeholderTextColor="#afafaf"
                            onFocus={() => handleFocus(400)}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Create Event</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity 
                    style={styles.dismissKeyboard}
                    onPress={Keyboard.dismiss}
                />
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        marginTop: 50,
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagePreview: {
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: '#3D8D7A',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
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