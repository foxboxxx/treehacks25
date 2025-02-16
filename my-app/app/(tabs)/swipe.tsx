import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SwipeCard from '@/components/SwipeCard';
import Button from '@/components/Button';
import { useState, useEffect } from 'react';
import { useNavigation } from 'expo-router';

// Database get
import { db } from '../utils/firebase/firebase.utils';
import { collection, getDocs, Firestore, updateDoc, doc } from 'firebase/firestore';
import { getUserData, auth } from '../utils/firebase/firebase.utils';

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


export default function SwipeScreen() {
  const [cardData, setCardData] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const fetchEvents = async () => {
    try {
      // Clear existing cards first
      setCardData([]);
      
      // Get user's liked/disliked events
      const userId = auth.currentUser?.uid;
      const userData = await getUserData(userId);
      const likedEvents = userData?.likedEvents || [];
      const dislikedEvents = userData?.dislikedEvents || [];
      const interactedEvents = [...likedEvents, ...dislikedEvents];

      console.log('User interacted events:', interactedEvents);

      // Fetch and filter events
      const eventsCollectionRef = collection(db as Firestore, 'events');
      const querySnapshot = await getDocs(eventsCollectionRef);
      
      const newEvents = querySnapshot.docs
        .filter(doc => !interactedEvents.includes(doc.id))
        .map(doc => ({
          id: doc.id,
          imageUrl: doc.data().imageUrl,
          title: doc.data().title,
          description: doc.data().description,
          date: doc.data().date,
          location: doc.data().location
        }));

      console.log('New unseen events:', newEvents);
      setCardData(newEvents);
      setCurrentIndex(0); // Reset index when new data is loaded
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Swipe screen focused, refreshing events...');
      fetchEvents();
    });

    return unsubscribe;
  }, [navigation]);

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

  if (currentIndex >= cardData.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>Come back soon for more opportunities!</Text>
        <Button title="Refresh List" onPress={fetchEvents} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentIndex + 1 < cardData.length && (
        <SwipeCard
          imageUrl={cardData[currentIndex + 1].imageUrl}
          title={cardData[currentIndex + 1].title}
          description={cardData[currentIndex + 1].description}
          date={cardData[currentIndex + 1].date}
          location={cardData[currentIndex + 1].location}
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
        location={cardData[currentIndex].location}
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
  }
});