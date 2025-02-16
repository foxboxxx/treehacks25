import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface SplashAnimationProps {
    setShowSplash: (show: boolean) => void;
}

export default function SplashAnimation({ setShowSplash }: SplashAnimationProps) {
    const leftStroke = useRef(new Animated.Value(0)).current;
    const rightStroke = useRef(new Animated.Value(0)).current;
    const flourish = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(leftStroke, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: false,
            }),
            Animated.timing(rightStroke, {
                toValue: 1,
                duration: 1400,
                useNativeDriver: false,
            }),
            Animated.timing(flourish, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false,
            }),
            Animated.delay(1000),
        ]).start(() => {
            setShowSplash(false);
        });
    }, []);

    const leftStrokeOffset = leftStroke.interpolate({
        inputRange: [0, 1],
        outputRange: [200, 0],
    });

    const rightStrokeOffset = rightStroke.interpolate({
        inputRange: [0, 1],
        outputRange: [200, 0],
    });

    const flourishOffset = flourish.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
    });

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Svg height="200" width="200" viewBox="0 0 100 100">
                    {/* Left stroke of V - more rounded */}
                    <AnimatedPath
                        d="M20 15 C20 15, 25 40, 45 75 C48 80, 50 82, 52 82"
                        stroke="#3D8D7A"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={200}
                        strokeDashoffset={leftStrokeOffset}
                    />
                    {/* Right stroke of V - with flowing curve */}
                    <AnimatedPath
                        d="M52 82 C55 82, 58 80, 60 75 C75 45, 80 25, 82 20 C83 18, 84 15, 87 15"
                        stroke="#3D8D7A"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={200}
                        strokeDashoffset={rightStrokeOffset}
                    />
                    {/* Final flourish */}
                    <AnimatedPath
                        d="M87 15 C90 15, 92 17, 92 22 C92 25, 90 27, 88 28"
                        stroke="#3D8D7A"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={100}
                        strokeDashoffset={flourishOffset}
                    />
                </Svg>
            </View>
        </View>
    );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f7f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
