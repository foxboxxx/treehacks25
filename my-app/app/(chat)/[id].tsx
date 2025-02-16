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
    ScrollView,
    Keyboard,
    KeyboardEvent
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { sendMessage, subscribeToMessages } from '../utils/firebase/firebase.utils';
import { auth } from '../utils/firebase/firebase.utils';

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
    read: boolean;
}

export default function ChatScreen() {
    const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (!id) return;
        
        const unsubscribe = subscribeToMessages(id, (updatedMessages: Message[]) => {
            setMessages(updatedMessages);
            setLocalMessages(updatedMessages);
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const keyboardWillShow = (event: KeyboardEvent) => {
            setKeyboardHeight(event.endCoordinates.height);
        };

        const keyboardWillHide = () => {
            setKeyboardHeight(0);
        };

        const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
        const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !id || isSending) return;

        try {
            setIsSending(true);
            const tempMessage = {
                id: Date.now().toString(),
                text: newMessage,
                senderId: auth.currentUser?.uid || '',
                timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 },
                read: false
            };
            setLocalMessages(prev => [...prev, tempMessage]);
            
            await sendMessage(id, newMessage);
            setNewMessage('');
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error sending message:', error);
            setLocalMessages(messages);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Stack.Screen 
                options={{
                    title: username || 'Chat',
                    headerBackTitle: 'Back',
                    headerStyle: {
                        backgroundColor: '#f0f7f0',
                    },
                    headerTintColor: '#2E7D32',
                }}
            />
            <View style={styles.container}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={localMessages}
                        renderItem={({ item }) => {
                            const isCurrentUser = item.senderId === auth.currentUser?.uid;
                            let dateString = '';
                            let timeString = '';
                            
                            if (item.timestamp) {
                                const messageDate = item.timestamp.seconds ? 
                                    new Date(item.timestamp.seconds * 1000) : 
                                    new Date(item.timestamp);
                                    
                                timeString = messageDate.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                });
                                
                                dateString = messageDate.toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric'
                                });
                            }

                            return (
                                <View style={[
                                    styles.messageContainer,
                                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                                ]}>
                                    <Text style={styles.messageText}>{item.text}</Text>
                                    <Text style={styles.timestamp}>
                                        {dateString && timeString ? `${dateString} at ${timeString}` : 'Sending...'}
                                    </Text>
                                </View>
                            );
                        }}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[
                            styles.messageListContent,
                            { paddingBottom: keyboardHeight + 100 }
                        ]}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                    
                    <View style={[
                        styles.inputContainer,
                        { bottom: keyboardHeight }
                    ]}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="#666"
                            multiline
                            maxLength={500}
                            editable={!isSending}
                        />
                        <TouchableOpacity 
                            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={isSending}
                        >
                            <Text style={styles.sendButtonText}>
                                {isSending ? 'Sending...' : 'Send'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messageListContent: {
        paddingBottom: 150,
        flexGrow: 1,
    },
    messageContainer: {
        margin: 8,
        padding: 10,
        borderRadius: 8,
        maxWidth: '80%',
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#B3D8A8',  // Match app green theme
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8E8E8',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3D8D7A',  // Match app theme
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sendButtonDisabled: {
        backgroundColor: '#cccccc',
    },
}); 