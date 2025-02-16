import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { auth } from '@/app/utils/firebase/firebase.utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/utils/firebase/firebase.utils';
import { getUserData } from '@/app/utils/firebase/firebase.utils';

interface PreferenceItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PersonalInfo {
  name: string;
  dateOfBirth: string;
  location: string;
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
    dateOfBirth: '',
    location: '',
  });

  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/150');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof PersonalInfo | null>(null);
  const [editValue, setEditValue] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlModalVisible, setImageUrlModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setImageError(false);
        
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const userData = await getUserData(userId);
        if (!userData) {
          setIsLoading(false);
          return;
        }

        setPersonalInfo({
          name: `${userData.firstName} ${userData.lastName}`,
          dateOfBirth: userData.age || 'Not set',
          location: `${userData.city}, ${userData.state}`,
        });

        if (userData.preferences) {
          setPreferences(userData.preferences);
        }

        if (userData.profileImage) {
          // Validate the stored image URL
          try {
            const response = await fetch(userData.profileImage);
            if (response.ok) {
              setProfileImage(userData.profileImage);
            } else {
              setImageError(true);
              setProfileImage('https://via.placeholder.com/150');
            }
          } catch (error) {
            setImageError(true);
            setProfileImage('https://via.placeholder.com/150');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
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
    setEditValue(personalInfo[field]);
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
      case 'dateOfBirth':
        return 'Date of Birth';
      case 'location':
        return 'Location';
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

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
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
                <IconSymbol name="chevron.right" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInfoItem('name', 'house.fill')}
            {renderInfoItem('dateOfBirth', 'house.fill')}
            {renderInfoItem('location', 'house.fill')}
          </View>

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
        </ScrollView>
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#B3D8A8',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4ECDC4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '500',
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
});
