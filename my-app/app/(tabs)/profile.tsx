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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

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
  const [preferences, setPreferences] = useState<PreferenceItem[]>([
    { id: 'notifications', label: 'Push Notifications', enabled: true },
    { id: 'darkMode', label: 'Dark Mode', enabled: false },
    { id: 'emailUpdates', label: 'Email Updates', enabled: true },
  ]);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: 'John Doe',
    dateOfBirth: 'January 1, 1990',
    location: 'San Francisco, CA',
  });

  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/150');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof PersonalInfo | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const togglePreference = (id: string) => {
    setPreferences(preferences.map(pref =>
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
  };

  const handleEditField = (field: keyof PersonalInfo) => {
    setEditingField(field);
    setEditValue(personalInfo[field]);
    setEditModalVisible(true);
  };

  const handleSaveField = () => {
    if (editingField) {
      setPersonalInfo(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      setEditModalVisible(false);
      setEditingField(null);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
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
    backgroundColor: '#FF6B6B',
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
});
