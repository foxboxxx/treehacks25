import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity,
    SafeAreaView,
    Image
} from 'react-native';
import { searchUsers, startChat, getUserChats } from '../utils/firebase/firebase.utils';
import { router } from 'expo-router';
import { auth } from '../utils/firebase/firebase.utils';

interface User {
    username: string;
    uid: string;
    profileImage?: string;
}

interface ChatPreview {
    chatId: string;
    otherUsername: string;
    lastMessage: string;
    lastMessageTime: Date;
    profileImage?: string;
}

export default function Messages() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [recentChats, setRecentChats] = useState<ChatPreview[]>([]);

    // Load chat history
    useEffect(() => {
        const loadChats = async () => {
            if (auth.currentUser) {
                const chats = await getUserChats(auth.currentUser.uid);
                setRecentChats(chats);
            }
        };
        loadChats();
    }, []);

    // Search users as typing
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (searchQuery.length > 0) {
                const results = await searchUsers(searchQuery);
                setSearchResults(results.slice(0, 3));
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchQuery]);

    const handleUserSelect = async (selectedUser: User) => {
        try {
            const chatId = await startChat(selectedUser.uid);
            router.push({
                pathname: "/(chat)/[id]",
                params: { 
                    id: chatId,
                    username: selectedUser.username
                }
            });
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const handleChatSelect = (chat: ChatPreview) => {
        router.push({
            pathname: "/(chat)/[id]",
            params: { 
                id: chat.chatId,
                username: chat.otherUsername
            }
        });
    };

    const renderChatItem = ({ item }: { item: ChatPreview }) => (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => handleChatSelect(item)}
        >
            <Image 
                source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.chatInfo}>
                <Text style={styles.username}>{item.otherUsername}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'No messages yet'}
                </Text>
            </View>
            <Text style={styles.timeStamp}>
                {item.lastMessageTime?.toLocaleDateString() || ''}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
            </View>

            {searchResults.length > 0 ? (
                <View style={styles.searchResults}>
                    <FlatList
                        data={searchResults}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.userItem}
                                onPress={() => handleUserSelect(item)}
                            >
                                <Image 
                                    source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
                                    style={styles.avatar}
                                />
                                <Text style={styles.username}>{item.username}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.uid}
                    />
                </View>
            ) : (
                <FlatList
                    data={recentChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.chatId}
                    style={styles.chatList}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    searchResults: {
        marginTop: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        marginHorizontal: 15,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chatList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    timeStamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
});
  

