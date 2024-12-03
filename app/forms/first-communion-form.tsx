import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';

const FirstCommunionForm: React.FC = () => {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [eventDates, setEventDates] = useState<string[]>([]);

  useEffect(() => {
    fetchEventDates();
  }, []);

  const fetchEventDates = async () => {
    const { data, error } = await supabase
      .from('event') // Replace 'appointments' with the correct table name
      .select('event_date');

    if (error) {
      console.error('Error fetching event dates:', error);
    } else {
      const dates = data.map((item: any) => item.event_date.split('T')[0]); // Extract date part only
      setEventDates(dates);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!childName || !birthday || !guardianName || !contactNumber || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a date.');
      return;
    }

    try {
      // Get the current user's ID
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      const userId = userResponse?.user?.id;

      if (userError || !userId) {
        console.error('Error fetching user ID:', userError);
        Alert.alert('Error', 'Failed to retrieve user information. Please try again.');
        return;
      }

      // Fetch the service ID for "First Communion"
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'First Communion')
        .single();

      if (serviceError || !serviceData) {
        console.error('Error fetching service ID:', serviceError);
        Alert.alert('Error', 'Failed to fetch the service ID. Please try again.');
        return;
      }

      const serviceId = serviceData.service_id;

      // Step 1: Create an Appointment with the user_id included
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId, // Set user_id from the authenticated user
            service_id: serviceId,
            appointment_date: selectedDate,
            status: 'pending', // Initial status
          },
        ])
        .select('appointment_id')
        .single();

      if (appointmentError || !appointmentData) {
        console.error('Error creating appointment:', appointmentError);
        Alert.alert('Error', 'Failed to create an appointment. Please try again.');
        return;
      }

      const appointmentId = appointmentData.appointment_id;

      // Step 2: Insert into firstcommunionforms table with the generated appointment_id
      const { error: formError } = await supabase.from('firstcommunionforms').insert([
        {
          child_name: childName,
          birthday: birthday,
          guardian_name: guardianName,
          contact_number: contactNumber,
          communion_date: selectedDate,
          appointment_id: appointmentId,
          status: 'pending', // Initial status
        },
      ]);

      if (formError) {
        console.error('Form submission error:', formError);
        Alert.alert('Booking Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Success', 'First communion appointment booked successfully.');
        router.back();
      }
    } catch (error) {
      console.error('Unexpected error during booking:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>First Communion Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Child's Full Name:</Text>
          <TextInput
            style={styles.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Enter child's full name"
          />

          <Text style={styles.label}>Birthday:</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="Enter birthday (YYYY-MM-DD)"
          />

          <Text style={styles.label}>Guardian's Name:</Text>
          <TextInput
            style={styles.input}
            value={guardianName}
            onChangeText={setGuardianName}
            placeholder="Enter guardian's name"
          />

          <Text style={styles.label}>Contact Number:</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Choose a Date for First Communion:</Text>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#C69C6D' },
              ...eventDates.reduce(
                (acc, date) => ({
                  ...acc,
                  [date]: { disabled: true, disableTouchEvent: true, dotColor: 'red' },
                }),
                {}
              ),
            }}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleAppointmentBooking}>
          <Text style={styles.submitButtonText}>Book First Communion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  submitButton: {
    backgroundColor: '#6A5D43',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FirstCommunionForm;
