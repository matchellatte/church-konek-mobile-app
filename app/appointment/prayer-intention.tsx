import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import SubmitButton from '../../components/SubmitButton';
import TopNavbar from '../../components/top-navbar';
import FormInputField from '../../components/form-input-field';
import { supabase } from '../../backend/lib/supabase';

const PrayerIntention: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [intention, setIntention] = useState('');
  const [day, setDay] = useState(new Date()); // For the day
  const [time, setTime] = useState(new Date()); // For the time
  const [prayerIntentionType, setPrayerIntentionType] = useState(''); // For the dropdown selection
  const [additionalDetails, setAdditionalDetails] = useState(''); // Additional details for the prayer intention
  const [showDatePicker, setShowDatePicker] = useState(false); // Control for date picker
  const [showTimePicker, setShowTimePicker] = useState(false); // Control for time picker

  const handleSubmit = async () => {
    if (!fullName || !day || !time || !prayerIntentionType || !intention) {
      Alert.alert('Validation Error', 'Please fill out all required fields.');
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Unable to retrieve user information. Please try again.');
        return;
      }

      const { error } = await supabase.from('prayerintentionforms_test').insert([
        {
          user_id: user.id,
          full_name: fullName,
          day: day.toISOString().split('T')[0],
          time: time.toTimeString().split(' ')[0],
          prayer_intention_type: prayerIntentionType,
          prayer_text: intention,
          additional_details: additionalDetails,
        },
      ]);

      if (error) {
        Alert.alert('Submission Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Thank You', 'Your prayer intention has been submitted.');
        router.back();
      }
    } catch (error) {
      Alert.alert('Submission Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  const Dropdown = ({ label, options, selectedValue, onValueChange, required }) => {
    return (
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => onValueChange(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select an option" value="" />
            {options.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TopNavbar title="Prayer Intention" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Contact Information Section */}
          <View style={styles.section}>
            <FormInputField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              required
            />
          </View>

          {/* Prayer Intention Details */}
          <View style={styles.section}>
            {/* Day Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.label}>Select Day</Text>
              <Text style={styles.input}>{day.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={day}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDay(selectedDate);
                }}
              />
            )}

            {/* Time Picker */}
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={styles.label}>Select Time</Text>
              <Text style={styles.input}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}

            <Dropdown
              label="Prayer Intention Type"
              options={['Thanksgiving', 'Special Intention', 'Others']}
              selectedValue={prayerIntentionType}
              onValueChange={setPrayerIntentionType}
              required
            />
            <FormInputField
              label="Additional Details"
              placeholder="Provide additional details for your prayer intention"
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              multiline
            />
            <FormInputField
              label="Your Prayer Intention"
              placeholder="Enter your prayer intention..."
              value={intention}
              onChangeText={setIntention}
              required
              multiline
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <SubmitButton label="Submit Prayer" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  dropdownContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F8F8F8',
    marginBottom: 10,
  },
});

export default PrayerIntention;

