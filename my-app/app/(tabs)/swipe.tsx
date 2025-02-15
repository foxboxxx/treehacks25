import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SwipeCard from '@/components/SwipeCard';
import Button from '@/components/Button';
import { useState } from 'react';

const cardData = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/400/600',
    title: 'First Card',
    description: 'first card example'
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/400/500',
    title: 'Second Card',
    description: 'second card example'
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/400/440',
    title: 'Third Card',
    description: 'third card example'
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/400/440',
    title: 'Third Carddada',
    description: 'third card example'
  },
  {
    id: 5,
    imageUrl: 'https://picsum.photos/400/440',
    title: 'Third Cardwdw',
    description: 'third cadsadard example'
  }
];

export default function SwipeScreen() {
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