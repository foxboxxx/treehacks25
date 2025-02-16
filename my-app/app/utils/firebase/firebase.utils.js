import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential
} from "firebase/auth";
import {
    getFirestore,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    collection,
    arrayUnion,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    increment,
    collectionGroup,
    writeBatch,
    deleteDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const firebaseConfig = {
    apiKey: "AIzaSyAjFb7UNPdRg971SGpQNtL7vQgQK2jTjUg",
    authDomain: "vuzz-ai.firebaseapp.com",
    projectId: "vuzz-ai",
    storageBucket: "vuzz-ai.appspot.com",
    messagingSenderId: "87873387402",
    appId: "1:87873387402:web:f9e7ae3b445fdff0326673",
    measurementId: "G-MF07SV95SR"
};
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Check if username exists
export const checkUsernameExists = async (username) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking username:", error);
        throw error;
    }
};

// Check if email exists
export const checkEmailExists = async (email) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking email:", error);
        throw error;
    }
};

export const logInWithEmailAndPassword = async (emailOrUsername, password) => {
    try {
        // First check if input is an email
        const isEmail = emailOrUsername.includes('@');
        
        if (isEmail) {
            const result = await signInWithEmailAndPassword(auth, emailOrUsername, password);
            return result;
        } else {
            // If username, first get the email associated with it
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", emailOrUsername));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error("Username not found");
            }

            const userDoc = querySnapshot.docs[0];
            const userEmail = userDoc.data().email;
            
            // Then sign in with the email
            const result = await signInWithEmailAndPassword(auth, userEmail, password);
            return result;
        }
    } catch (err) {
        console.error("Error during sign in:", err);
        throw err;
    }
};

export const registerWithEmailAndPassword = async (email, password, userData) => {
    try {
        // Validate username format
        if (!userData.username) {
            throw new Error("Username is required");
        }

        // Convert to lowercase for consistency
        const lowerEmail = email.toLowerCase();
        const lowerUsername = userData.username.toLowerCase();

        // Check if username already exists
        const usernameExists = await checkUsernameExists(lowerUsername);
        if (usernameExists) {
            throw new Error("Username already taken");
        }

        // Check if email already exists
        const emailExists = await checkEmailExists(lowerEmail);
        if (emailExists) {
            throw new Error("Email already registered");
        }

        // Add additional validation
        if (lowerUsername.length < 3) {
            throw new Error("Username must be at least 3 characters long");
        }

        if (lowerUsername.length > 20) {
            throw new Error("Username must be less than 20 characters");
        }

        // Check username format (letters, numbers, underscores only)
        if (!/^[a-zA-Z0-9_]+$/.test(lowerUsername)) {
            throw new Error("Username can only contain letters, numbers, and underscores");
        }

        const res = await createUserWithEmailAndPassword(auth, lowerEmail, password);
        const user = res.user;
        
        // Create user document with all fields
        const userDocData = {
            uid: user.uid,
            email: lowerEmail,
            username: lowerUsername,
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            city: userData.city,
            state: userData.state,
            createdAt: new Date(),
            items: []
        };
        
        await setDoc(doc(db, "users", user.uid), userDocData);
        return user;
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            throw new Error("Email already registered");
        }
        if (err.code === 'auth/weak-password') {
            throw new Error("Password should be at least 6 characters");
        }
        console.error("Error during registration:", err);
        throw err;
    }
};

export const createEvent = async (eventData) => {
    try {
        const eventRef = doc(collection(db, "events"));
        await setDoc(eventRef, {
            id: eventRef.id,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            imageUrl: eventData.imageUrl,
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });
        return eventRef.id;
    } catch (err) {
        console.error("Error creating event:", err);
        throw err;
    }
};

export const addEventToUser = async (userId, eventId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            events: arrayUnion(eventId)
        });
    } catch (err) {
        console.error("Error adding event to user:", err);
        throw err;
    }
};

export const getUserEvents = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        const eventIds = userData.events || [];
        
        const events = await Promise.all(
            eventIds.map(async (eventId) => {
                const eventDoc = await getDoc(doc(db, "events", eventId));
                return { id: eventDoc.id, ...eventDoc.data() };
            })
        );
        
        return events;
    } catch (err) {
        console.error("Error getting user events:", err);
        throw err;
    }
};

export const getUserData = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.data();
    } catch (err) {
        console.error("Error getting user data:", err);
        throw err;
    }
};

// Search users by username
export const searchUsers = async (searchQuery) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("username", ">=", searchQuery),
            where("username", "<=", searchQuery + '\uf8ff'),
            limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (doc.id !== auth.currentUser?.uid) { // Don't include current user
                users.push({
                    uid: doc.id,
                    username: userData.username,
                    profileImage: userData.profileImage
                });
            }
        });
        return users;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};

// Start or get existing chat
export const startChat = async (otherUserId) => {
    try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) throw new Error("User not authenticated");

        const sortedIds = [currentUserId, otherUserId].sort();
        const chatId = sortedIds.join('_');

        // Only check if chat exists, don't create it yet
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            // Don't create the chat document here
            // It will be created when the first message is sent
            console.log("Chat doesn't exist yet");
        }

        return chatId;
    } catch (error) {
        console.error("Error checking chat:", error);
        throw error;
    }
};

// Send a message
export const sendMessage = async (chatId, text) => {
    try {
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);
        const currentUserId = auth.currentUser.uid;

        // If chat doesn't exist, create it with the first message
        if (!chatDoc.exists()) {
            const [user1, user2] = chatId.split('_');
            const otherUserId = user1 === currentUserId ? user2 : user1;

            // Create chat document first
            await setDoc(chatRef, {
                participants: [currentUserId, otherUserId],
                createdAt: serverTimestamp(),
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                [`${currentUserId}_unread`]: 0,
                [`${otherUserId}_unread`]: 1
            });
        }

        // Now add the message
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messageData = {
            text,
            senderId: currentUserId,
            timestamp: serverTimestamp(),
            read: false
        };
        
        const newMessageRef = await addDoc(messagesRef, messageData);
        
        // Update last message only if chat already existed
        if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(id => id !== currentUserId);
            
            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                messages: arrayUnion(newMessageRef.id),
                [`${otherUserId}_unread`]: increment(1),
                [`${currentUserId}_unread`]: 0
            });
        }
        
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// Subscribe to messages
export const subscribeToMessages = (chatId, callback) => {
    try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(q, {
            next: (snapshot) => {
                // Only process if there are actual changes
                if (!snapshot.metadata.hasPendingWrites) {
                    const messages = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        messages.push({
                            id: doc.id,
                            text: data.text,
                            senderId: data.senderId,
                            timestamp: data.timestamp,
                            read: data.read
                        });
                    });
                    callback(messages);
                }
            },
            error: (error) => {
                console.error("Error in messages subscription:", error);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up message subscription:", error);
        return () => {};
    }
};

export const getUserChats = async (userId) => {
    try {
        // Query chats where user is a participant (without sorting)
        const chatsRef = collection(db, "chats");
        const q = query(
            chatsRef,
            where("participants", "array-contains", userId)
        );
        
        const querySnapshot = await getDocs(q);
        const chats = [];
        
        for (const docSnapshot of querySnapshot.docs) {
            try {
                const chatData = docSnapshot.data();
                const otherUserId = chatData.participants.find(id => id !== userId);
                
                if (!otherUserId) continue;

                const otherUserRef = doc(db, "users", otherUserId);
                const otherUserDoc = await getDoc(otherUserRef);
                const otherUserData = otherUserDoc.data();
                
                if (otherUserData && otherUserData.username) {
                    const lastMessageTime = chatData.lastMessageTime ? 
                        new Date(chatData.lastMessageTime.seconds * 1000) : 
                        new Date();

                    chats.push({
                        chatId: docSnapshot.id,
                        otherUsername: otherUserData.username,
                        lastMessage: chatData.lastMessage || 'No messages yet',
                        lastMessageTime,
                        profileImage: otherUserData.profileImage || 'https://via.placeholder.com/50',
                        unreadCount: chatData[`${userId}_unread`] || 0
                    });
                }
            } catch (error) {
                console.error(`Error processing chat ${docSnapshot.id}:`, error);
                continue;
            }
        }
        
        // Sort in memory instead
        return chats.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    } catch (error) {
        console.error("Error getting user chats:", error);
        throw error;
    }
};

// Delete chat and all its messages
export const deleteChat = async (chatId) => {
    try {
        // Get reference to chat document and messages subcollection
        const chatRef = doc(db, "chats", chatId);
        const messagesRef = collection(db, "chats", chatId, "messages");

        // Delete all messages in the subcollection first
        const messagesSnapshot = await getDocs(messagesRef);
        const batch = writeBatch(db);

        messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Execute the batch delete for messages
        await batch.commit();

        // Finally delete the chat document itself
        await deleteDoc(chatRef);
    } catch (error) {
        console.error("Error deleting chat:", error);
        throw error;
    }
};

