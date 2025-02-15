import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
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
  style?: any;
}

const ViewCard: React.FC<CardProps> = ({
  imageUrl,
  title,
  description,
  style,
}) => {
    return (
        <View> 
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      width: SCREEN_WIDTH * 0.9,
      height: SCREEN_HEIGHT * 0.7,
      backgroundColor: 'white',
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
      fontSize: 16,
      color: '#666',
    },
  });
  
  export default ViewCard;