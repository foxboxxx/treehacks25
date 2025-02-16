import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getUserData, getUserEvents, auth } from '../utils/firebase/firebase.utils';
import { router, useNavigation } from 'expo-router';
import CreateEventModal from '../../components/CreateEventModal';
import { collection, getDocs, Firestore, query, where, documentId, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/firebase.utils';

type Event = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
};

export default function HomeScreen() {
    const [userData, setUserData] = useState<any>(null);
    const [userEvents, setUserEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [likedEvents, setLikedEvents] = useState<Event[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('Home screen focused, refreshing data...');
            loadUserData();
            fetchLikedEvents();
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        loadUserData();
        fetchLikedEvents();
    }, []);

    const loadUserData = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                router.replace('/');
                return;
            }

            const data = await getUserData(userId);
            const events = await getUserEvents(userId);
            
            // Sort events by date and get top 3
            const sortedEvents = events.sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            ).slice(0, 3);
            
            setUserData(data);
            setUserEvents(sortedEvents);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLikedEvents = async () => {
        try {
            const userId = auth.currentUser?.uid;
            console.log('Current user ID:', userId);
            if (!userId) return;

            const userDoc = await getUserData(userId);
            const likedEventIds = userDoc?.likedEvents || [];
            console.log('Liked event IDs:', likedEventIds);

            if (likedEventIds.length === 0) {
                console.log('No liked events found');
                return;
            }

            const eventsRef = collection(db as Firestore, 'events');
            const q = query(eventsRef, where(documentId(), 'in', likedEventIds));
            const querySnapshot = await getDocs(q);
            
            const events = querySnapshot.docs.map(doc => {
                console.log('Event data:', doc.id, doc.data());
                return {
                    id: doc.id,
                    title: doc.data().title,
                    date: doc.data().date,
                    time: doc.data().time,
                    location: doc.data().location
                };
            }) as Event[];

            // Sort by date and get top 3
            const sortedEvents = events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3);
            
            console.log('Final sorted events:', sortedEvents);
            setLikedEvents(sortedEvents);
        } catch (error) {
            console.error('Error fetching liked events:', error);
        }
    };

    const handleUnenroll = async (eventId: string) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const userRef = doc(db as Firestore, 'users', userId);
            const userData = await getUserData(userId);
            const likedEvents = userData?.likedEvents || [];

            // Remove the event from likedEvents
            const updatedLikedEvents = likedEvents.filter(id => id !== eventId);
            await updateDoc(userRef, {
                likedEvents: updatedLikedEvents
            });

            // Set empty array if last event was removed
            if (updatedLikedEvents.length === 0) {
                setLikedEvents([]);
            } else {
                // Refresh the events list
                fetchLikedEvents();
            }
            
            console.log('Removed from liked events:', eventId);
        } catch (error) {
            console.error('Error removing event:', error);
        }
    };

    const renderEvent = ({ item }: { item: Event }) => {
        const handlePress = () => {
            Alert.alert(
                "Unenroll from Event",
                "Are you sure you want to unenroll from this event?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Unenroll", 
                        style: "destructive",
                        onPress: () => handleUnenroll(item.id)
                    }
                ]
            );
        };

        return (
            <TouchableOpacity 
                style={styles.eventCard}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDetails}>{item.date} at {item.time}</Text>
                <Text style={styles.eventLocation}>{item.location}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>
                Welcome, {userData?.firstName}!
            </Text>
            
            <View style={styles.upcomingEventsSection}>
                <Text style={styles.sectionTitle}>Your Upcoming Events</Text>
                
                {likedEvents.length > 0 ? (
                    <FlatList
                        data={likedEvents}
                        renderItem={renderEvent}
                        keyExtractor={(item) => item.id}
                        style={styles.eventList}
                        scrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View style={styles.noEventsContainer}>
                        <Text style={styles.noEventsText}>
                            You haven't liked any events yet.
                        </Text>
                        <TouchableOpacity 
                            style={styles.browseButton}
                            onPress={() => router.push('/(tabs)/swipe')}
                        >
                            <Text style={styles.browseButtonText}>
                                Browse Events in Vuzz Tab
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.createEventSection}>
                <Text style={styles.sectionTitle}>Create an Event</Text>
                <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.createButtonText}>Create New Event</Text>
                </TouchableOpacity>
            </View>

            <CreateEventModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onEventCreated={() => {
                    loadUserData();
                    setModalVisible(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        marginTop: 20,
    },
    upcomingEventsSection: {
        marginBottom: 30,
    },
    createEventSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    eventList: {
        maxHeight: 300, // Limit the height of the event list
    },
    eventCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    eventDetails: {
        fontSize: 16,
        color: '#666',
        marginBottom: 3,
    },
    eventLocation: {
        fontSize: 16,
        color: '#666',
    },
    noEventsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noEventsText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: '#666',
    },
    browseButton: {
        backgroundColor: '#3D8D7A',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    browseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
