import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';
import { auth } from '@/app/utils/firebase/firebase.utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/utils/firebase/firebase.utils';
import { getUserData } from '@/app/utils/firebase/firebase.utils';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

interface PreferenceItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PersonalInfo {
  name: string;
  location: string;
  bio: string;
  tags: string[];
  organizationName?: string;
  organizationPending?: boolean;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<PreferenceItem[]>([
    { id: 'notifications', label: 'Push Notifications', enabled: true },
    { id: 'darkMode', label: 'Dark Mode', enabled: false },
    { id: 'emailUpdates', label: 'Email Updates', enabled: true },
  ]);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    location: '',
    bio: '',
    tags: [],
  });

  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/150');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof PersonalInfo | null>(null);
  const [editValue, setEditValue] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlModalVisible, setImageUrlModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [username, setUsername] = useState('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['12%', '50%', '90%'], []);
  const router = useRouter();

  // Add state to track bottom sheet position
  const [bottomSheetPosition, setBottomSheetPosition] = useState(0);

  // Add animated value for rotation
  const rotationAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          router.replace('/');
          return;
        }

        const userData = await getUserData(userId);
        
        if (!userData) {
          setIsLoading(false);
          return;
        }

        setUsername(userData.username);
        setPersonalInfo({
          name: `${userData.firstName} ${userData.lastName}`,
          location: `${userData.city}, ${userData.state}`,
          bio: userData.bio || 'Add a bio...',
          tags: userData.tags || [],
        });

        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleImageError = () => {
    setImageError(true);
    setProfileImage('https://via.placeholder.com/150'); // Fallback image
    Alert.alert('Error', 'Failed to load image. Please try a different URL.');
  };

  const updateProfileImage = async () => {
    try {
      setImageLoading(true);
      setImageError(false);
      
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Validate image URL by attempting to load it
      const response = await fetch(imageUrlInput);
      if (!response.ok) {
        throw new Error('Invalid image URL');
      }

      setProfileImage(imageUrlInput);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profileImage: imageUrlInput
      });
      
      setImageUrlModalVisible(false);
      setImageUrlInput('');
    } catch (error) {
      Alert.alert('Error', 'Invalid image URL or failed to update profile image');
      setImageError(true);
    } finally {
      setImageLoading(false);
    }
  };

  const togglePreference = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const updatedPreferences = preferences.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      );

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        preferences: updatedPreferences
      });

      setPreferences(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const handleEditField = (field: keyof PersonalInfo) => {
    setEditingField(field);
    const value = personalInfo[field];
    setEditValue(typeof value === 'string' ? value : '');
    setEditModalVisible(true);
  };

  const handleSaveField = async () => {
    if (editingField) {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, "users", userId);
        let updateData = {};

        if (editingField === 'name') {
          const [firstName, lastName] = editValue.split(' ');
          updateData = { firstName, lastName };
        } else if (editingField === 'location') {
          const [city, state] = editValue.split(', ');
          updateData = { city, state };
        } else if (editingField === 'bio') {
          updateData = { bio: editValue };
        } else {
          updateData = { [editingField]: editValue };
        }

        await updateDoc(userRef, updateData);
        
        setPersonalInfo(prev => ({
          ...prev,
          [editingField]: editValue
        }));
        setEditModalVisible(false);
        setEditingField(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to update information');
      }
    }
  };

  const getFieldLabel = (field: keyof PersonalInfo): string => {
    switch (field) {
      case 'name':
        return 'Name';
      case 'location':
        return 'Location';
      case 'bio':
        return 'Bio';
      default:
        return '';
    }
  };

  const renderInfoItem = (field: keyof PersonalInfo, icon: IconSymbolName) => (
    <TouchableOpacity style={styles.infoItem} onPress={() => handleEditField(field)}>
        <IconSymbol name={icon} size={20} color="#666" />
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{getFieldLabel(field)}</Text>
            <Text style={styles.infoValue}>{personalInfo[field]}</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderBottomSheetContent = () => (
    <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {preferences.map((pref) => (
          <View key={pref.id} style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>{pref.label}</Text>
            <Switch
              value={pref.enabled}
              onValueChange={() => togglePreference(pref.id)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={pref.enabled ? '#4ECDC4' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <IconSymbol name="lock.fill" size={20} color="#666" />
          <Text style={styles.settingLabel}>Privacy Settings</Text>
          <IconSymbol name="chevron.right" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <IconSymbol name="bell.fill" size={20} color="#666" />
          <Text style={styles.settingLabel}>Notification Settings</Text>
          <IconSymbol name="chevron.right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <IconSymbol name="gear" size={20} color="#666" />
          <Text style={styles.settingLabel}>Account Settings</Text>
          <IconSymbol name="chevron.right" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </BottomSheetScrollView>
  );

  // Update the handle tap function
  const handleBottomSheetExpand = () => {
    if (bottomSheetPosition === 1) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.snapToIndex(1);
    }
  };

  // Update the onChange handler
  const handleSheetPositionChange = (index: number) => {
    setBottomSheetPosition(index);
    Animated.timing(rotationAnimation, {
      toValue: index === 1 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Create interpolated rotation value
  const rotateChevron = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Add background view */}
        <View style={styles.background} />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Profile Header */}
              <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                  <Text style={styles.usernameText}>@{username}</Text>
                  <Image
                    source={{ 
                      uri: imageError ? 'https://via.placeholder.com/150' : profileImage 
                    }}
                    style={styles.profileImage}
                    onError={handleImageError}
                  />
                  {imageLoading && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="large" color="#4ECDC4" />
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.editImageButton} 
                    onPress={() => setImageUrlModalVisible(true)}
                  >
                    <Text style={styles.plusIcon}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Personal Information Section */}
              
              <View style={styles.personalInfoContainer}>
                <TouchableOpacity style={styles.infoRow} onPress={() => handleEditField('name')}>
                  <Text style={styles.nameText}>{personalInfo.name}</Text>
                </TouchableOpacity>
              </View>

              {/* Location field below profile picture */}
              <TouchableOpacity 
                style={styles.locationContainer} 
                onPress={() => handleEditField('location')}
              >
                <View style={styles.locationRow}>
                  <IconSymbol 
                    name="location" 
                    size={18}  // Match fontSize of locationText
                    color="#ededed"  // Match color of locationText
                    style={styles.locationIcon} 
                  />
                  <Text style={styles.locationText}>{personalInfo.location}</Text>
                </View>
              </TouchableOpacity>

              {/* Bio field below location */}
              <TouchableOpacity 
                style={styles.bioContainer} 
                onPress={() => handleEditField('bio')}
              >
                <View style={styles.bioRow}>
                  <Text style={styles.bioText}>{personalInfo.bio}</Text>
                  <IconSymbol 
                    name="pencil" 
                    size={17}
                    color="#FFFFFF"
                    style={styles.bioIcon} 
                  />
                </View>
              </TouchableOpacity>

              {/* Tags section below bio */}
              <View style={styles.tagsContainer}>
                {personalInfo.tags?.map((tag, index) => (
                  <View key={index} style={styles.tagBubble}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}

              </View>
            </ScrollView>

            <BottomSheet
              ref={bottomSheetRef}
              snapPoints={snapPoints}
              enablePanDownToClose={false}
              index={0}
              style={styles.bottomSheet}
              onChange={handleSheetPositionChange}
              handleComponent={() => (
                <TouchableOpacity 
                  style={styles.bottomSheetHandle}
                  onPress={handleBottomSheetExpand}
                >
                  <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
                    <IconSymbol 
                      name="chevron.up" 
                      size={20} 
                      color="#2E7D32"
                    />
                  </Animated.View>
                </TouchableOpacity>
              )}
            >
              {renderBottomSheetContent()}
            </BottomSheet>
          </>
        )}

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Edit {editingField ? getFieldLabel(editingField) : ''}
              </Text>
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter ${editingField ? getFieldLabel(editingField).toLowerCase() : ''}`}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveField}
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Add new Modal for image URL input */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageUrlModalVisible}
          onRequestClose={() => setImageUrlModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Profile Image</Text>
              <TextInput
                style={styles.input}
                value={imageUrlInput}
                onChangeText={setImageUrlInput}
                placeholder="Enter image URL"
                autoCapitalize="none"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setImageUrlModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={updateProfileImage}
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 400,
    zIndex: 1,
  },
  header: {
    backgroundColor: '#B3D8A8',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 3,
  },
  profileImage: {
    width: 288,
    height: 288,
    borderRadius: 144,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  editImageButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#2E7D32',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  plusIcon: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
    textAlign: 'center',
    marginTop: -3,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  saveButtonText: {
    color: '#FFF',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContent: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  bottomSheet: {
    marginBottom: 49,
  },
  bottomSheetHandle: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  background: {
    backgroundColor: '#B3D8A8',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  usernameText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  personalInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -10,
  },
  infoRow: {
    marginBottom: 24,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  locationContainer: {
    alignItems: 'center',
    marginTop: -15,
    paddingHorizontal: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    color: '#ededed',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  bioContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioIcon: {
    marginLeft: 8,
  },
  bioText: {
    //color: '#FBFFE4',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  tagBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 15,
    margin: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
