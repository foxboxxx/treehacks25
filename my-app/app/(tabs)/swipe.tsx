import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SwipeCard from '@/components/SwipeCard';
import Button from '@/components/Button';
import { useState, useEffect } from 'react';

// Database get
import { db } from '../utils/firebase/firebase.utils';
import { collection, getDocs, Firestore } from 'firebase/firestore';

const cardData = [
  {
    id: "1",
    imageUrl: 'https://picsum.photos/400/600',
    title: 'First Card',
    description: 'first card example',
    date: '2025-01-01',
    location: 'New York, NY'
  },
  {
    id: "2",
    imageUrl: 'https://picsum.photos/400/500',
    title: 'Second Card',
    description: 'second card example',
    date: '2025-01-02',
    location: 'Los Angeles, CA'
  },
  {
    id: "3",
    imageUrl: 'https://picsum.photos/400/440',
    title: 'Third Card',
    description: 'third card example',
    date: '2025-01-03',
    location: 'Chicago, IL'
  },
  {
    id: "4",
    imageUrl: 'https://picsum.photos/400/128',
    title: '4 Carddada',
    description: 'third card example',
    date: '2025-01-04',
    location: 'San Francisco, CA'
  },
  {
    id: "5",
    imageUrl: 'https://picsum.photos/400/893',
    title: '5 Cardwdw',
    description: 'third cadsadard example',
    date: '2025-01-05',
    location: 'New York, NY'
  }
];


export default function SwipeScreen() {
  // Get events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollectionRef = collection(db as Firestore, 'events');
        const querySnapshot = await getDocs(eventsCollectionRef);
        querySnapshot.forEach((doc) => {
          cardData.push({
            id: doc.id,
            imageUrl: doc.data().imageUrl,
            title: doc.data().title,
            description: doc.data().description,
            date: doc.data().date,
            location: doc.data().location
          });
          console.log('Event:', { id: doc.id, ...doc.data() });
        });
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    if (currentIndex < cardData.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < cardData.length) {
      setCurrentIndex(currentIndex => currentIndex + 1);
    //   setCurrentIndex(currentIndex + 1);
    }
  };

  if (currentIndex >= cardData.length) {
    // console.log("No more!");
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>All out for today!</Text>
        <Button title="Restart" onPress={() => setCurrentIndex(0)} />
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