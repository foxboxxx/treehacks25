import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Fonts } from '@/constants/Fonts';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface CardProps {
  imageUrl: string;
  title: string;
  description: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  currentIndex: number;
  isLocked: boolean;
  style?: any;
}

const SwipeCard: React.FC<CardProps> = ({
  imageUrl,
  title,
  description,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  currentIndex,
  isLocked,
  style,
}) => {
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardRotate.value = 0;
    scale.value = 1;
    }, [currentIndex]);
  
  // Gesture Handler
  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
        scale.value = withSpring(1.05); // Slight scale up on touch
        
    },
    onActive: (event) => {
        translateX.value = event.translationX;
        cardRotate.value = event.translationX / SCREEN_WIDTH * 0.4; // Rotate based on X movement
    },
    onEnd: (event) => {

      scale.value = withSpring(1); // Reset scale
  
      const swipeDistance = Math.abs(event.translationX);
  
      if (swipeDistance > SWIPE_THRESHOLD) {
        // console.log("Swiping...");
        const direction = event.translationX > 0 ? 1 : -1; // Sets the direction to flyout
        const flyOutDistance = direction * SCREEN_WIDTH * 1.5; // Dictates flyout distance
  
        translateX.value = withSpring(flyOutDistance, { damping: 50, stiffness: 400 }, () => {
            // console.log("Swiping...", swipeDistance);
            // console.log(direction);
          if (direction > 0 && onSwipeRight) {
            runOnJS(onSwipeRight)();
          } else if (direction < 0 && onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          }
        //   translateX.value = 0;
        //   translateY.value = 0;
        //   cardRotate.value = 0;
        });
      } else{
        // Return to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
        cardRotate.value = withSpring(0, { damping: 15, stiffness: 400 });
      }
    },
  });


  // Animated styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotate.value}rad` },
      { scale: scale.value },
    ],
  }));

  return !isLocked ? (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={[styles.container, style, cardStyle]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  ) : (
    <Animated.View style={[styles.container, style, cardStyle]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#FBFFE4',
    borderRadius: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    ...Fonts.abel,
    fontSize: 16,
    color: '#666',
  },
});

export default SwipeCard;