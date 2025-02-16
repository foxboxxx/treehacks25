import React, { useState, useRef } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    Image,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard,
    Alert
} from 'react-native';
import { createEvent } from '../app/utils/firebase/firebase.utils';
import CalendarPicker from 'react-native-calendar-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LocationPicker from './LocationPicker';

interface CreateEventModalProps {
    visible: boolean;
    onClose: () => void;
    onEventCreated: () => void;
}

interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
}

const TAGS = [
    'FundraiserHelper',
    'EventVolunteer',
    'Tutoring',
    'BeachCleanup',
    'TreePlanting',
    'DisasterRelief',
    'MentalHealthSupport',
    'PetRescue',
    'SocialMediaForChange'
];

export default function CreateEventModal({ visible, onClose, onEventCreated }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [period, setPeriod] = useState('AM');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleSubmit = async () => {
        try {
            if (!title || !description || !date || !time || !location) {
                Alert.alert('Error', 'Please fill in all fields including location');
                return;
            }

            const eventData = {
                title,
                description,
                date,
                time,
                location,
                city,
                state,
                latitude,
                longitude,
                imageUrl,
                tags: selectedTags,
            };

            await createEvent(eventData);
            onEventCreated();
            onClose();
            
            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setTime('');
            setCity('');
            setState('');
            setLatitude(0);
            setLongitude(0);
            setLocation('');
            setImageUrl('');
            setSelectedTags([]);
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Error', 'Failed to create event. Please try again.');
        }
    };


    const handleFocus = (y: number) => {
        scrollViewRef.current?.scrollTo({
            y: y,
            animated: true
        });
    };

    const handleDateSelect = (selectedDate: Date) => {
        const formattedDate = selectedDate.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        setDate(formattedDate);
        setShowCalendar(false);
    };

    const handleTimeUpdate = (newHour: string, newMinute: string, newPeriod: string) => {
        const formattedHour = newHour.padStart(2, '0');
        const formattedMinute = newMinute.padStart(2, '0');
        setTime(`${formattedHour}:${formattedMinute} ${newPeriod}`);
        setHour(newHour);
        setMinute(newMinute);
        setPeriod(newPeriod);
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUrl(result.assets[0].uri);
            }
        } catch (error) {
            alert('Error selecting image');
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleLocationSelect = (locationData: LocationData) => {
        setCity(locationData.city);
        setState(locationData.state);
        setLatitude(locationData.latitude);
        setLongitude(locationData.longitude);
        setLocation(`${locationData.city}, ${locationData.state}`);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Create New Event</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Image URL (e.g., https://example.com/image.jpg)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            placeholderTextColor="#afafaf"
                            autoCapitalize="none"
                            onFocus={() => handleFocus(0)}
                        />
                        
                        {imageUrl && (
                            <View style={styles.imagePreview}>
                                <Image 
                                    source={{ uri: imageUrl }} 
                                    style={styles.previewImage}
                                    onError={() => {
                                        alert('Invalid image URL');
                                        setImageUrl('');
                                    }}
                                />
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Event Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#afafaf"
                            onFocus={() => handleFocus(250)}
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            placeholderTextColor="#afafaf"
                        />

                        <View style={styles.tagSection}>
                            <Text style={styles.tagTitle}>Select Event Tags</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.tagScrollView}
                            >
                                {TAGS.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[
                                            styles.tag,
                                            selectedTags.includes(tag) && styles.selectedTag
                                        ]}
                                        onPress={() => toggleTag(tag)}
                                    >
                                        <Text style={[
                                            styles.tagText,
                                            selectedTags.includes(tag) && styles.selectedTagText
                                        ]}>
                                            #{tag}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.dateContainer}>
                            {showCalendar && (
                                <View style={styles.calendarContainer}>
                                    <CalendarPicker
                                        onDateChange={(date) => handleDateSelect(date as Date)}
                                        minDate={new Date()}
                                        selectedDayColor="#3D8D7A"
                                        selectedDayTextColor="#FFFFFF"
                                        todayBackgroundColor="#f2f2f2"
                                        width={320}
                                    />
                                </View>
                            )}

                            <View style={styles.timePickerContainer}>
                                <TouchableOpacity 
                                    style={styles.input}
                                    onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                                >
                                    <Text style={[
                                        styles.dateText,
                                        !time && styles.placeholderText
                                    ]}>
                                        {time || 'Select Time'}
                                    </Text>
                                </TouchableOpacity>

                                {showTimeDropdown && (
                                    <View style={styles.timeDropdownContainer}>
                                        <View style={styles.timeInputsRow}>
                                            <View style={styles.timeInputContainer}>
                                                <TextInput
                                                    style={styles.timeInput}
                                                    placeholder="HH"
                                                    value={hour}
                                                    onChangeText={(text) => {
                                                        const num = parseInt(text);
                                                        if ((num >= 1 && num <= 12) || text === '') {
                                                            setHour(text);
                                                        }
                                                    }}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                />
                                                <Text style={styles.timeLabel}>Hour</Text>
                                            </View>

                                            <View style={styles.timeInputContainer}>
                                                <TextInput
                                                    style={styles.timeInput}
                                                    placeholder="MM"
                                                    value={minute}
                                                    onChangeText={(text) => {
                                                        const num = parseInt(text);
                                                        if ((num >= 0 && num <= 59) || text === '') {
                                                            setMinute(text);
                                                        }
                                                    }}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                />
                                                <Text style={styles.timeLabel}>Minute</Text>
                                            </View>

                                            <View style={styles.timeInputContainer}>
                                                <TouchableOpacity
                                                    style={styles.periodSelector}
                                                    onPress={() => setPeriod(period === 'AM' ? 'PM' : 'AM')}
                                                >
                                                    <Text style={styles.periodText}>{period}</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.timeLabel}>AM/PM</Text>
                                            </View>
                                        </View>
                                        
                                        <TouchableOpacity 
                                            style={styles.confirmTimeButton}
                                            onPress={() => {
                                                handleTimeUpdate(hour, minute, period);
                                                setShowTimeDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.confirmTimeText}>Confirm Time</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity 
                                style={styles.input}
                                onPress={() => setShowCalendar(!showCalendar)}
                            >
                                <Text style={[
                                    styles.dateText,
                                    !date && styles.placeholderText
                                ]}>
                                    {date || 'Select Date'}
                                </Text>
                            </TouchableOpacity>


                        </View>

                        <View style={styles.locationSection}>
                            <Text style={styles.label}>Location</Text>
                            <LocationPicker 
                                onLocationSelect={handleLocationSelect}
                            />
                            {location && (
                                <Text style={styles.selectedLocation}>
                                    Selected: {city}, {state}
                                </Text>
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Create Event</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity 
                    style={styles.dismissKeyboard}
                    onPress={Keyboard.dismiss}
                />
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        marginTop: 50,
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagePreview: {
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: '#3D8D7A',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dismissKeyboard: {
        height: 30,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#000',
        paddingVertical: 12,
    },
    placeholderText: {
        color: '#afafaf',
    },
    dateContainer: {
        zIndex: 2,
        position: 'relative',
        marginBottom: 15,
    },
    timePickerContainer: {
        marginTop: 10,
        zIndex: 1,
    },
    timeDropdownContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    timeInputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    timeInputContainer: {
        alignItems: 'center',
        flex: 1,
    },
    timeInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    timeLabel: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
    },
    periodSelector: {
        width: 60,
        height: 40,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodText: {
        fontSize: 16,
        color: '#000',
    },
    remainingInputs: {
        opacity: 1,
    },
    hiddenInputs: {
        opacity: 0,
        height: 0,
        marginBottom: 0,
    },
    calendarContainer: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 3,
    },
    confirmTimeButton: {
        backgroundColor: '#3D8D7A',
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
    },
    confirmTimeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    tagSection: {
        marginBottom: 15,
    },
    tagTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    tagScrollView: {
        flexGrow: 0,
    },
    tag: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#3D8D7A',
    },
    selectedTag: {
        backgroundColor: '#3D8D7A',
    },
    tagText: {
        fontSize: 14,
        color: '#3D8D7A',
    },
    selectedTagText: {
        color: '#fff',
    },
    locationSection: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    selectedLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
}); 