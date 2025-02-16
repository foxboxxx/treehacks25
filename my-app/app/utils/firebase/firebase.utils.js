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
    onSnapshot
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

export const checkUsernameExists = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
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

        // Check if username already exists
        const usernameExists = await checkUsernameExists(userData.username);
        if (usernameExists) {
            throw new Error("Username already taken");
        }

        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        
        // Create user document with all fields
        const userDocData = {
            uid: user.uid,
            email: email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            city: userData.city,
            state: userData.state,
            createdAt: new Date(),
            items: [],
            likedEvents: new Array(),
            dislikedEvents: new Array()
        };
        
        await setDoc(doc(db, "users", user.uid), userDocData);
        return user;
    } catch (err) {
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

        // Create a unique chat ID by sorting user IDs
        const chatId = [currentUserId, otherUserId].sort().join('_');
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            // Create new chat
            await setDoc(chatRef, {
                participants: [currentUserId, otherUserId],
                createdAt: new Date(),
                lastMessage: null,
                lastMessageTime: null
            });
        }

        return chatId;
    } catch (error) {
        console.error("Error starting chat:", error);
        throw error;
    }
};

// Send a message
export const sendMessage = async (chatId, text) => {
    try {
        const messageRef = doc(collection(db, "chats", chatId, "messages"));
        const message = {
            id: messageRef.id,
            text,
            senderId: auth.currentUser.uid,
            timestamp: new Date(),
        };
        
        await setDoc(messageRef, message);
        
        // Update last message in chat
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: text,
            lastMessageTime: new Date()
        });
        
        return message;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// Subscribe to messages
export const subscribeToMessages = (chatId, callback) => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ ...doc.data() });
        });
        callback(messages);
    });
};

export const getUserChats = async (userId) => {
    try {
        const chatsRef = collection(db, "chats");
        const q = query(
            chatsRef,
            where("participants", "array-contains", userId)
        );
        
        const querySnapshot = await getDocs(q);
        const chats = [];
        
        for (const docSnapshot of querySnapshot.docs) {
            const chatData = docSnapshot.data();
            const otherUserId = chatData.participants.find(id => id !== userId);
            const otherUserRef = doc(db, "users", otherUserId);
            const otherUserDoc = await getDoc(otherUserRef);
            const otherUserData = otherUserDoc.data();
            
            chats.push({
                chatId: docSnapshot.id,
                otherUsername: otherUserData.username,
                lastMessage: chatData.lastMessage,
                lastMessageTime: chatData.lastMessageTime?.toDate(),
                profileImage: otherUserData.profileImage
            });
        }
        
        return chats.sort((a, b) => 
            (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
        );
    } catch (error) {
        console.error("Error getting user chats:", error);
        throw error;
    }
};

