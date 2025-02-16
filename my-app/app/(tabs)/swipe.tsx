import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import SwipeCard from '@/components/SwipeCard';
import Button from '@/components/Button';
import { useState, useEffect } from 'react';
import { useNavigation } from 'expo-router';

// Database get
import { db } from '../utils/firebase/firebase.utils';
import { collection, getDocs, Firestore, updateDoc, doc } from 'firebase/firestore';
import { getUserData, auth } from '../utils/firebase/firebase.utils';

// Add type for location
interface EventLocation {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}

// Add this interface at the top with other interfaces
interface EventData {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    date: string;
    location: string | EventLocation;
    tags: string[];
}

const cardData = [
  // {
  //   id: "1",
  //   imageUrl: 'https://picsum.photos/400/600',
  //   title: 'First Card',
  //   description: 'first card example',
  //   date: '2025-01-01',
  //   location: 'New York, NY'
  // },
  // {
  //   id: "2",
  //   imageUrl: 'https://picsum.photos/400/500',
  //   title: 'Second Card',
  //   description: 'second card example',
  //   date: '2025-01-02',
  //   location: 'Los Angeles, CA'
  // },
  // {
  //   id: "3",
  //   imageUrl: 'https://picsum.photos/400/440',
  //   title: 'Third Card',
  //   description: 'third card example',
  //   date: '2025-01-03',
  //   location: 'Chicago, IL'
  // },
  // {
  //   id: "4",
  //   imageUrl: 'https://picsum.photos/400/128',
  //   title: '4 Carddada',
  //   description: 'third card example',
  //   date: '2025-01-04',
  //   location: 'San Francisco, CA'
  // },
  // {
  //   id: "5",
  //   imageUrl: 'https://picsum.photos/400/893',
  //   title: '5 Cardwdw',
  //   description: 'third cadsadard example',
  //   date: '2025-01-05',
  //   location: 'New York, NY'
  // }
];

// Add this helper function
const formatLocation = (location: string | EventLocation) => {
    if (typeof location === 'string') {
        return location;
    }
    return `${location.city}, ${location.state}`;
};

export default function SwipeScreen() {
  const [cardData, setCardData] = useState<EventData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(true);
  const [tagFilterEnabled, setTagFilterEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setCardData([]);
      setCurrentIndex(0);
      
      const userId = auth.currentUser?.uid;
      const userData = await getUserData(userId);
      const likedEvents = userData?.likedEvents || [];
      const dislikedEvents = userData?.dislikedEvents || [];
      const interactedEvents = [...likedEvents, ...dislikedEvents];
      const userTags = userData?.tags || [];
      const userLat = userData?.latitude || 0;
      const userLong = userData?.longitude || 0;

      console.log('Filters:', {
        location: locationFilterEnabled ? 'ON (only nearby)' : 'OFF (all locations)',
        tags: tagFilterEnabled ? 'ON (matching tags)' : 'OFF (all tags)'
      });

      const eventsCollectionRef = collection(db as Firestore, 'events');
      const querySnapshot = await getDocs(eventsCollectionRef);
      
      const newEvents = querySnapshot.docs
        .filter(doc => {
          const eventData = doc.data();
          
          if (interactedEvents.includes(doc.id)) return false;

          const eventLat = eventData.latitude || 0;
          const eventLong = eventData.longitude || 0;
          const latDiff = Math.abs(eventLat - userLat);
          const longDiff = Math.abs(eventLong - userLong);
          const isNearby = latDiff <= 0.72 && longDiff <= 0.72;
          
          // Always check location first
          if (locationFilterEnabled && !isNearby) {
            return false; // If location filter is ON and event is not nearby, reject it
          }

          // Then check tags if needed
          if (tagFilterEnabled) {
            const eventTags = eventData.tags || [];
            return eventTags.some((tag: string) => userTags.includes(tag));
          }

          // If we get here, the event passed all active filters
          return true;
        })
        .map(doc => ({
          id: doc.id,
          imageUrl: doc.data().imageUrl,
          title: doc.data().title,
          description: doc.data().description,
          date: doc.data().date,
          location: doc.data().location,
          tags: doc.data().tags || []
        }));

      setCardData(newEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the auto-refresh on focus
  useEffect(() => {
    // Initial fetch only
    fetchEvents();
  }, []);

  const handleSwipeLeft = async () => {
    if (currentIndex < cardData.length) {
      const eventId = cardData[currentIndex].id;
      setCurrentIndex(currentIndex + 1); // Update UI immediately

      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db as Firestore, 'users', userId);
        const userData = await getUserData(userId);
        const dislikedEvents = userData?.dislikedEvents || [];

        await updateDoc(userRef, {
          dislikedEvents: [...dislikedEvents, eventId]
        });

        console.log('Added to disliked events:', eventId);
      } catch (error) {
        console.error('Error updating disliked events:', error);
      }
    }
  };

  const handleSwipeRight = async () => {
    if (currentIndex < cardData.length) {
      const eventId = cardData[currentIndex].id;
      setCurrentIndex(currentIndex + 1); // Update UI immediately

      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db as Firestore, 'users', userId);
        const userData = await getUserData(userId);
        const likedEvents = userData?.likedEvents || [];

        await updateDoc(userRef, {
          likedEvents: [...likedEvents, eventId]
        });

        console.log('Added to liked events:', eventId);
      } catch (error) {
        console.error('Error updating liked events:', error);
      }
    }
  };

  // Update the toggle handlers to use async/await properly
  const toggleLocationFilter = async () => {
    setLocationFilterEnabled(prev => !prev);
    await fetchEvents(); // Wait for fetch to complete
  };

  const toggleTagFilter = async () => {
    setTagFilterEnabled(prev => !prev);
    await fetchEvents(); // Wait for fetch to complete
  };

  // Update the "no more cards" view with styled button
  if (currentIndex >= cardData.length) {
    return (
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchEvents}
          >
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, locationFilterEnabled && styles.filterButtonEnabled]}
            onPress={toggleLocationFilter}
          >
            <Text style={styles.filterText}>
              Location: {locationFilterEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, tagFilterEnabled && styles.filterButtonEnabled]}
            onPress={toggleTagFilter}
          >
            <Text style={styles.filterText}>
              Tags: {tagFilterEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.endMessage}>Come back soon for more opportunities!</Text>
      </View>
    );
  }

  // Update the render to show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchEvents}
        >
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, locationFilterEnabled && styles.filterButtonEnabled]}
          onPress={toggleLocationFilter}
        >
          <Text style={styles.filterText}>
            Location: {locationFilterEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, tagFilterEnabled && styles.filterButtonEnabled]}
          onPress={toggleTagFilter}
        >
          <Text style={styles.filterText}>
            Tags: {tagFilterEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {currentIndex + 1 < cardData.length && (
        <SwipeCard
          imageUrl={cardData[currentIndex + 1].imageUrl}
          title={cardData[currentIndex + 1].title}
          description={cardData[currentIndex + 1].description}
          date={cardData[currentIndex + 1].date}
          location={formatLocation(cardData[currentIndex + 1].location)}
          tags={cardData[currentIndex + 1].tags}
          id={cardData[currentIndex + 1].id}
          style={{ 
            transform: [{ scale: 0.95 }] 
          }}
          currentIndex={currentIndex + 1}
          isLocked={true}
        />
      )}

      <SwipeCard
        imageUrl={cardData[currentIndex].imageUrl}
        title={cardData[currentIndex].title}
        description={cardData[currentIndex].description}
        date={cardData[currentIndex].date}
        location={formatLocation(cardData[currentIndex].location)}
        tags={cardData[currentIndex].tags}
        id={cardData[currentIndex].id}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        currentIndex={currentIndex}
        isLocked={false}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  endMessage: {
    fontSize: 20,
    color: '#666',
  },
  eventLocation: {
    // Add appropriate styles for the event location
  },
  location: {
    // Add appropriate styles for the location text
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#16a34a',
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  filterContainer: {
    position: 'absolute',
    top: 80,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#ef4444',
    height: 35,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonEnabled: {
    backgroundColor: '#16a34a',
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});