import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';

const HouseBlessingForm: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date')
      .eq('status', 'Available');
      
    if (error) {
      console.log('Error fetching available dates:', error);
    } else {
      const dates = data.map((item: any) => item.appointment_date);
      setAvailableDates(dates);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!fullName || !address || !contactNumber || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a date.');
      return;
    }

    try {
      // Retrieve the current user's ID
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      const userId = userResponse?.user?.id;

      if (userError || !userId) {
        console.error('Error fetching user ID:', userError);
        Alert.alert('Error', 'Failed to retrieve user information. Please try again.');
        return;
      }

      // Fetch the service ID for "House Blessing"
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'House Blessing')
        .single();

      if (serviceError || !serviceData) {
        console.error('Error fetching service ID:', serviceError);
        Alert.alert('Error', 'Failed to fetch the service ID. Please try again.');
        return;
      }

      const serviceId = serviceData.service_id;

      // Step 1: Create an Appointment with user_id
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            service_id: serviceId,
            appointment_date: selectedDate,
            status: 'pending', // Initial status
          }
        ])
        .select('appointment_id')
        .single();

      if (appointmentError || !appointmentData) {
        console.error('Error creating appointment:', appointmentError);
        Alert.alert('Error', 'Failed to create an appointment. Please try again.');
        return;
      }

      const appointmentId = appointmentData.appointment_id;

      // Step 2: Insert into houseblessingforms table with the generated appointment_id
      const { error: formError } = await supabase.from('houseblessingforms').insert([
        {
          full_name: fullName,
          address: address,
          contact_number: contactNumber,
          blessing_date: selectedDate,
          appointment_id: appointmentId, // Link to the appointment
          status: 'pending', // Initial status
        },
      ]);

      if (formError) {
        console.error('Form submission error:', formError);
        Alert.alert('Booking Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Success', 'House blessing appointment booked successfully.');
        router.back();
      }
    } catch (error) {
      console.error('Unexpected error during booking:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>House Blessing Form</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Full Name:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />

          <Text style={styles.label}>Complete Address:</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your complete address"
            multiline
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
          <Text style={styles.label}>Choose a Date for House Blessing:</Text>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#C69C6D' },
              ...availableDates.reduce(
                (acc, date) => ({ ...acc, [date]: { disabled: true, disableTouchEvent: true, dotColor: 'red' } }),
                {}
              ),
            }}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleAppointmentBooking}>
          <Text style={styles.submitButtonText}>Book House Blessing</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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

export default HouseBlessingForm;
