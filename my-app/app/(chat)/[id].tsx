import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { sendMessage, subscribeToMessages } from '../utils/firebase/firebase.utils';
import { auth } from '../utils/firebase/firebase.utils';

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Date;
}

export default function ChatScreen() {
    const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!id) return;
        
        const unsubscribe = subscribeToMessages(id, (updatedMessages: Message[]) => {
            setMessages(updatedMessages);
        });

        return () => unsubscribe();
    }, [id]);

    const handleSend = async () => {
        if (!newMessage.trim() || !id) return;

        try {
            await sendMessage(id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <>
            <Stack.Screen 
                options={{
                    title: username || 'Chat',
                    headerBackTitle: 'Back'
                }}
            />
            <SafeAreaView style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => {
                        const isCurrentUser = item.senderId === auth.currentUser?.uid;
                        return (
                            <View style={[
                                styles.messageContainer,
                                isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                            ]}>
                                <Text style={styles.messageText}>{item.text}</Text>
                                <Text style={styles.timestamp}>
                                    {new Date(item.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </Text>
                            </View>
                        );
                    }}
                    keyExtractor={(item) => item.id}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    onLayout={() => flatListRef.current?.scrollToEnd()}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.sendButton} 
                            onPress={handleSend}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messageContainer: {
        margin: 8,
        padding: 10,
        borderRadius: 8,
        maxWidth: '80%',
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8E8E8',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
    },
}); 