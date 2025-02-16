import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity,
    SafeAreaView,
    Image,
    Alert
} from 'react-native';
import { searchUsers, startChat, getUserChats, deleteChat } from '../utils/firebase/firebase.utils';
import { router } from 'expo-router';
import { auth } from '../utils/firebase/firebase.utils';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/firebase.utils';

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
    unreadCount: number;
}

export default function Messages() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [recentChats, setRecentChats] = useState<ChatPreview[]>([]);

    // Subscribe to chat updates
    useEffect(() => {
        if (!auth.currentUser) return;

        const chatsRef = collection(db, "chats");
        const q = query(
            chatsRef,
            where("participants", "array-contains", auth.currentUser.uid),
            orderBy("lastMessageTime", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatsData = [];
            for (const docSnap of snapshot.docs) {
                try {
                    const chatData = docSnap.data();
                    const otherUserId = chatData.participants.find(
                        (id: string) => id !== auth.currentUser?.uid
                    );
                    
                    if (!otherUserId) continue;

                    const otherUserRef = doc(db, "users", otherUserId);
                    const otherUserDoc = await getDoc(otherUserRef);
                    const otherUserData = otherUserDoc.data() || {};

                    if (otherUserData.username) {
                        const lastMessageTime = chatData.lastMessageTime ? 
                            new Date(chatData.lastMessageTime.seconds * 1000) : 
                            new Date();

                        chatsData.push({
                            chatId: docSnap.id,
                            otherUsername: otherUserData.username,
                            lastMessage: chatData.lastMessage || 'No messages yet',
                            lastMessageTime,
                            profileImage: otherUserData.profileImage || 'https://via.placeholder.com/50',
                            unreadCount: chatData[`${auth.currentUser?.uid}_unread`] || 0  // Fixed null check
                        });
                    }
                } catch (error) {
                    console.error(`Error processing chat ${docSnap.id}:`, error);
                }
            }
            setRecentChats(chatsData);
        });

        return () => unsubscribe();
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

    const handleChatSelect = async (chat: ChatPreview) => {
        try {
            // Mark messages as read when entering chat
            if (chat.unreadCount > 0) {
                const chatRef = doc(db, "chats", chat.chatId);
                await updateDoc(chatRef, {
                    [`${auth.currentUser?.uid}_unread`]: 0  // Reset unread count
                });
            }

            router.push({
                pathname: "/(chat)/[id]",
                params: { 
                    id: chat.chatId,
                    username: chat.otherUsername
                }
            });
        } catch (error) {
            console.error('Error selecting chat:', error);
        }
    };

    const handleDeleteChat = async (chat: ChatPreview) => {
        try {
            Alert.alert(
                "Delete Chat",
                "Are you sure you want to delete this chat? This will delete all messages and cannot be undone.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        onPress: async () => {
                            try {
                                await deleteChat(chat.chatId);
                            } catch (error) {
                                console.error('Error deleting chat:', error);
                                Alert.alert("Error", "Failed to delete chat. Please try again.");
                            }
                        },
                        style: "destructive"
                    }
                ]
            );
        } catch (error) {
            console.error('Error in delete chat dialog:', error);
        }
    };

    const renderChatItem = ({ item }: { item: ChatPreview }) => (
        <TouchableOpacity 
            style={[
                styles.chatItem,
                item.unreadCount > 0 && { backgroundColor: '#B3D8A8' }
            ]}
            onPress={() => handleChatSelect(item)}
            onLongPress={() => handleDeleteChat(item)}
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
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unreadBadge: {
        backgroundColor: '#3D8D7A',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    unreadChatItem: {
        backgroundColor: '#B3D8A8',  // Highlight color for unread messages
    },
});
  

