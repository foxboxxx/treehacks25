import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { getUserData, getUserEvents, auth } from '../utils/firebase/firebase.utils';
import { router } from 'expo-router';
import CreateEventModal from '../../components/CreateEventModal';

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

    useEffect(() => {
        loadUserData();
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

    const renderEvent = ({ item }: { item: Event }) => (
        <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDetails}>{item.date} at {item.time}</Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <Text style={styles.welcomeText}>
                            Welcome, {userData?.firstName}!
                        </Text>
                        
                        <View style={styles.upcomingEventsSection}>
                            <Text style={styles.sectionTitle}>Your Upcoming Events</Text>
                            
                            {userEvents.length > 0 ? (
                                <View style={styles.eventList}>
                                    {userEvents.map(event => renderEvent({ item: event }))}
                                </View>
                            ) : (
                                <View style={styles.noEventsContainer}>
                                    <Text style={styles.noEventsText}>
                                        You haven't signed up for any events yet.
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
                    </>
                )}
                data={[]} // Empty data since we're using header component
                renderItem={() => null}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

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
