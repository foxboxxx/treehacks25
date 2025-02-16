import React, { useEffect, useState, forwardRef } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
  interpolate,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.5;

interface CardProps {
  imageUrl: string;
  title: string;
  description: string;
  date: string;
  location: string;
  id: string;
  currentIndex?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isLocked: boolean;
  style?: any;
  tags: string[];
}

const SwipeCard = forwardRef<any, CardProps>(({
  imageUrl,
  title,
  description,
  date,
  location,
  id,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  style,
  tags,
}, ref) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotate.value = 0;
    cardRotate.value = 0;
    setIsFlipped(false);
  }, [currentIndex]);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (isFlipped) return; // Don't allow swipe if card is flipped
      scale.value = withSpring(1.00);
    },
    onActive: (event) => {
      if (isFlipped) return; // Don't allow swipe if card is flipped
      translateX.value = event.translationX;
      cardRotate.value = event.translationX / SCREEN_WIDTH * 0.4;
    },
    onEnd: (event) => {
      if (isFlipped) return; // Don't allow swipe if card is flipped
      
      scale.value = withSpring(1);
      const swipeDistance = Math.abs(event.translationX);
      
      if (swipeDistance > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        const flyOutDistance = direction * SCREEN_WIDTH * 1.5;
        
        translateX.value = withSpring(flyOutDistance, { damping: 50, stiffness: 400 }, () => {
          if (direction > 0 && onSwipeRight) {
            runOnJS(onSwipeRight)();
          } else if (direction < 0 && onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
        cardRotate.value = withSpring(0);
      }
    },
  });

  const handleFlip = () => {
    // Only flip if there's no active swipe gesture
    if (Math.abs(translateX.value) < 10) {
      rotate.value = withTiming(isFlipped ? 0 : 180, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      setIsFlipped(!isFlipped);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotate.value,
      [0, 180],
      [0, 180]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateY: `${rotateValue}deg` },
        { rotate: `${cardRotate.value}rad` },
        { scale: scale.value },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotate.value,
      [0, 180],
      [180, 360]
    );

    return {
      transform: [
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ['rgba(255, 116, 108, 0.7)', 'transparent', 'rgba(176, 242, 182, 0.7)']
    );
    
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor,
    };
  });

  const checkIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD/2, SWIPE_THRESHOLD],
      [0, 0.5, 1]
    );
    
    return {
      position: 'absolute',
      left: 40,
      top: SCREEN_HEIGHT * 0.3,
      opacity,
      transform: [{ scale: opacity }],
    };
  });

  const xIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD/2, 0],
      [1, 0.5, 0]
    );
    
    return {
      position: 'absolute',
      right: 40,
      top: SCREEN_HEIGHT * 0.3,
      opacity,
      transform: [{ scale: opacity }],
    };
  });

  return (
    <>
      <Animated.View style={backgroundStyle} />
      
      <Animated.View style={checkIconStyle}>
        <Ionicons name="checkmark-circle" size={100} color="rgba(0, 255, 0, 0.7)" />
      </Animated.View>
      
      <Animated.View style={xIconStyle}>
        <Ionicons name="close-circle" size={100} color="rgba(255, 0, 0, 0.7)" />
      </Animated.View>

      <PanGestureHandler onGestureEvent={panGesture} enabled={!isFlipped}>
        <Animated.View style={[styles.container, style]} ref={ref}>
          <Pressable 
            onPress={handleFlip}
            style={{ flex: 1 }}
          >
            <Animated.View style={[styles.card, frontAnimatedStyle]}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <View style={styles.textOverlay}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
              <View style={styles.backContent}>
                <Text style={styles.backTitle}>{title}</Text>
                <View style={styles.backDetails}>
                  <Text style={styles.backLabel}>Date & Time:</Text>
                  <Text style={styles.backText}>{date}</Text>
                  
                  <Text style={styles.backLabel}>Location:</Text>
                  <Text style={styles.backText}>{location}</Text>
                  
                  <Text style={styles.backLabel}>Description:</Text>
                  <Text style={styles.backText}>{description}</Text>

                  <Text style={styles.backLabel}>Tags:</Text>
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.backLabel}>Event ID:</Text>
                  <Text style={styles.backText}>{id}</Text>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
});

export default SwipeCard;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    position: 'absolute',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    // position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  backCard: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  backContent: {
    padding: 20,
    width: '100%',
    height: '100%',
  },
  backTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  backDetails: {
    flex: 1,
    gap: 12,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});