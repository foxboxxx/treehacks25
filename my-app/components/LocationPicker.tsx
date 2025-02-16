import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
}

interface LocationPickerProps {
    onLocationSelect: (location: LocationData) => void;
    initialLocation: LocationData | null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [region, setRegion] = useState<Region>({
        latitude: initialLocation?.latitude || 37.78825,
        longitude: initialLocation?.longitude || -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                ...region,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setRegion(newRegion);
            handleLocationChange(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            setError('Error getting location');
            console.error('Error getting location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationChange = async (latitude: number, longitude: number) => {
        try {
            const response = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (response && response[0]) {
                const address = response[0];
                console.log('Address found:', address);
                
                const city = address.city || address.subregion || address.region;
                const state = address.region;
                
                if (!city || !state) {
                    console.log('Missing city or state:', { city, state });
                    setError('Could not determine city and state for this location');
                    return;
                }

                const locationData = {
                    latitude,
                    longitude,
                    city,
                    state
                };
                
                console.log('Selecting location:', locationData);
                onLocationSelect(locationData);
                setError(null);
            }
        } catch (error) {
            console.error('Error getting address:', error);
            setError('Error getting address');
        }
    };

    const handleRegionChange = (newRegion: Region) => {
        handleLocationChange(newRegion.latitude, newRegion.longitude);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3D8D7A" />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <MapView
                style={styles.map}
                region={region}
                onRegionChange={setRegion}
                onRegionChangeComplete={handleRegionChange}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                <Marker
                    coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude
                    }}
                    draggable
                    onDragEnd={(e) => handleLocationChange(
                        e.nativeEvent.coordinate.latitude,
                        e.nativeEvent.coordinate.longitude
                    )}
                />
            </MapView>
            <Text style={styles.helpText}>
                Move the map to select your location
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 5,
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    helpText: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 5,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 12,
    },
}); 