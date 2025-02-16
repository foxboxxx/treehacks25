import React, { useEffect, useState, forwardRef } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
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
  currentIndex?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isLocked: boolean;
  style?: any;
}

const SwipeCard = forwardRef<any, CardProps>(({
  imageUrl,
  title,
  description,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  style,
}, ref) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotate.value = 0;
    cardRotate.value = 0;
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    rotate.value = withTiming(isFlipped ? 0 : 180, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    setIsFlipped(!isFlipped);
  };

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      runOnJS(setIsGestureActive)(true);
      scale.value = withSpring(1.00);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    //   translateY.value = event.translationY;
      cardRotate.value = event.translationX / SCREEN_WIDTH * 0.4;
    },
    onEnd: (event) => {
      runOnJS(setIsGestureActive)(false);
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
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={handleFlip}
            style={{ flex: 1 }}
            disabled={isGestureActive}
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
                <Text style={styles.backText}>More details coming soon!</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
  },
  backText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
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
});