import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface AddressData {
  city: string;
  region: string; // state
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  } | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null);
  const [address, setAddress] = useState<AddressData | null>(
    initialLocation ? { city: initialLocation.city, region: initialLocation.state } : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      // Get initial address
      await getAddressFromCoordinates(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    })();
  }, []);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addressResponse && addressResponse[0]) {
        const newAddress = {
          city: addressResponse[0].city || 'Unknown City',
          region: addressResponse[0].region || 'Unknown State'
        };
        setAddress(newAddress);
        
        // Call parent callback with complete location data
        onLocationSelect({
          latitude,
          longitude,
          city: newAddress.city,
          state: newAddress.region
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setErrorMsg('Failed to get address from coordinates');
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    
    // Get address whenever location changes
    await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const handleMarkerDrag = async (e: any) => {
    const newLocation = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };
    setLocation(newLocation);
    
    // Get address whenever marker is dragged
    await getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setShowMap(!showMap)}
      >
        <Text style={styles.buttonText}>
          {showMap ? 'Hide Map' : 'Select Location on Map'}
        </Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.infoContainer}>
          <Text style={styles.locationText}>
            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          {address && (
            <Text style={styles.addressText}>
              Location: {address.city}, {address.region}
            </Text>
          )}
        </View>
      )}

      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}

      {showMap && location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
              onDragEnd={handleMarkerDrag}
            />
          </MapView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3D8D7A',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  addressText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default LocationPicker; 