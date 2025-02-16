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
    arrayUnion
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

export const logInWithEmailAndPassword = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully:", result.user.uid);
        return result;
    } catch (err) {
        console.error("Error during sign in:", err);
        throw err;
    }
};

export const registerWithEmailAndPassword = async (email, password, userData) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            city: userData.city,
            state: userData.state,
            createdAt: new Date(),
            items: []
        });
        
        console.log("User registered successfully:", user.uid);
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

