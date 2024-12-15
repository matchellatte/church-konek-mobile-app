import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../backend/lib/supabase';
import TopNavbar from '../../components/top-navbar';
import CalendarDatePicker from '../../components/calendar-date-picker';
import FormInputField from '../../components/form-input-field';
import SubmitButton from '../../components/SubmitButton';
import { useRouter } from 'expo-router';

const HouseBlessingForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [eventDates, setEventDates] = useState<string[]>([]);
  const router = useRouter();

  // Fetch unavailable dates on component mount
  useEffect(() => {
    fetchEventDates();
  }, []);

  const fetchEventDates = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('status', 'pending'); // Fetch dates with pending status

      if (error) throw error;

      const dates = data.map((item: any) => item.appointment_date.split('T')[0]);
      setEventDates(dates);
    } catch (error) {
      Alert.alert('Error', 'Failed to load unavailable dates. Please try again later.');
    }
  };

  const handleAppointmentBooking = async () => {
    // Validate all input fields
    if (!fullName || !address || !contactNumber || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a date.');
      return;
    }

    try {
      // Check if the selected date is already booked
      const { data: existingAppointments, error: checkError } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('appointment_date', selectedDate)
        .eq('status', 'pending');

      if (checkError) throw checkError;

      if (existingAppointments.length > 0) {
        Alert.alert('Date Unavailable', 'The selected date is already booked. Please choose another date.');
        return;
      }

      // Fetch authenticated user
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      const userId = userResponse?.user?.id;

      if (userError || !userId) {
        Alert.alert('Error', 'Failed to retrieve user information. Please try again.');
        return;
      }

      // Fetch service ID for "House Blessing"
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'House Blessing')
        .single();

      if (serviceError || !serviceData) {
        Alert.alert('Error', 'Failed to fetch the service ID. Please try again.');
        return;
      }

      const serviceId = serviceData.service_id;

      // Insert appointment into 'appointments' table
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            service_id: serviceId,
            appointment_date: selectedDate,
            status: 'pending',
          },
        ])
        .select('appointment_id')
        .single();

      if (appointmentError || !appointmentData) {
        Alert.alert('Error', 'Failed to create an appointment. Please try again.');
        return;
      }

      const appointmentId = appointmentData.appointment_id;

      // Insert house blessing form data into 'houseblessingforms' table
      const { error: formError } = await supabase.from('houseblessingforms').insert([
        {
          full_name: fullName,
          address: address,
          contact_number: contactNumber,
          blessing_date: selectedDate,
          appointment_id: appointmentId,
          status: 'pending',
        },
      ]);

      if (formError) {
        Alert.alert('Error', 'Failed to book house blessing appointment. Please try again.');
      } else {
        Alert.alert('Success', 'House blessing appointment booked successfully.');
        router.push(`/(tabs)/appointment`);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar title="House Blessing Form" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* House Blessing Date Section */}
          <CalendarDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            eventDates={eventDates} // Pass unavailable dates
          />

          {/* Personal Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <FormInputField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              required
            />
            <FormInputField
              label="Complete Address"
              placeholder="Enter your complete address"
              value={address}
              onChangeText={setAddress}
              required
              multiline
            />
            <FormInputField
              label="Contact Number"
              placeholder="Enter contact number"
              value={contactNumber}
              onChangeText={setContactNumber}
              required
              keyboardType="phone-pad"
            />
          </View>

          {/* Book Appointment Button */}
          <SubmitButton label="Book House Blessing" onPress={handleAppointmentBooking} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 50,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginBottom: 15,
  },
});

export default HouseBlessingForm;


