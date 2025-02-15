import { createContext, useContext, useState, PropsWithChildren } from "react";
import { router } from 'expo-router';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { registerWithEmailAndPassword, logInWithEmailAndPassword } from "../../utils/firebase/firebase.utils";

type AuthContextType = {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    firstName: string;
    setFirstName: (name: string) => void;
    lastName: string;
    setLastName: (name: string) => void;
    age: string;
    setAge: (age: string) => void;
    city: string;
    setCity: (city: string) => void;
    state: string;
    setState: (state: string) => void;
    handleSignIn: () => Promise<void>;
    handleSignUp: () => Promise<void>;
    navigateToSignUp: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default function SignIn() {
    const { email, setEmail, password, setPassword, handleSignIn } = useAuth();
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Welcome to Vuzz</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.secondaryButton]} 
                        onPress={() => router.push("../auth/signup")}
                    >
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");

    const navigateToSignUp = () => {
        router.push("../auth/signup");
    };

    const handleSignUp = async () => {
        if (!email || !password || !firstName || !lastName || !age || !city || !state) {
            alert('Please fill in all fields');
            return;
        }
        try {
            const user = await registerWithEmailAndPassword(email, password, {
                firstName,
                lastName,
                age,
                city,
                state
            });
            if (user) {
                console.log("Navigating to tabs...");
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            alert(error.message || "Registration failed");
            console.error("Registration error:", error);
        }
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        try {
            const result = await logInWithEmailAndPassword(email, password);
            if (result) {
                console.log("Navigating to tabs...");
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            alert(error.message || "Sign in failed");
            console.error("Sign in error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            email,
            setEmail,
            password,
            setPassword,
            firstName,
            setFirstName,
            lastName,
            setLastName,
            age,
            setAge,
            city,
            setCity,
            state,
            setState,
            handleSignIn,
            handleSignUp,
            navigateToSignUp
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
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
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    secondaryButton: {
        backgroundColor: '#34C759',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});