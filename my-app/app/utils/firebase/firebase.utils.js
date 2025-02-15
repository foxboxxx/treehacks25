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
} from "firebase/firestore";

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

