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

const WeddingForm: React.FC = () => {
  const router = useRouter();
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [eventDates, setEventDates] = useState<string[]>([]);

  useEffect(() => {
    fetchEventDates();
  }, []);

  // Fetch event dates from the event table
  const fetchEventDates = async () => {
    const { data, error } = await supabase
      .from('event')
      .select('event_date');

    if (error) {
      console.log('Error fetching event dates:', error);
    } else {
      const dates = data.map((item: any) => item.event_date.split('T')[0]); // Extract date part only
      setEventDates(dates);
    }
  };

  // Book the appointment and insert data into the WeddingForms table
  const handleAppointmentBooking = async () => {
    if (!brideName || !groomName || !contactNumber || !selectedDate) {
      Alert.alert('Please fill out all fields and choose a wedding date.');
      return;
    }
  
    try {
      // Fetch the current user's ID
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }
      console.log('User ID:', userId);
  
      // Fetch the service ID for "Wedding"
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'Wedding')
        .single();
  
      if (serviceError || !serviceData) {
        console.error('Error fetching service ID:', serviceError);
        Alert.alert('Error', 'Failed to fetch the service ID for Wedding. Please try again.');
        return;
      }
  
      const serviceId = serviceData.service_id;
      console.log('Service ID:', serviceId);
  
      // Step 1: Create an Appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            service_id: serviceId,
            appointment_date: selectedDate,
            status: 'pending',
          }
        ])
        .select('appointment_id')
        .single(); // Get the generated appointment_id
  
      if (appointmentError || !appointmentData) {
        console.error('Error creating appointment:', appointmentError);
        Alert.alert('Error', 'Failed to create an appointment. Please try again.');
        return;
      }
  
      const appointmentId = appointmentData.appointment_id;
      console.log('Appointment ID:', appointmentId);
  
      // Step 2: Insert into WeddingForms table with the generated appointment_id
      const { data: weddingFormData, error: formError } = await supabase.from('weddingforms').insert([
        {
          bride_name: brideName,
          groom_name: groomName,
          contact_number: contactNumber,
          wedding_date: selectedDate,
          appointment_id: appointmentId,
        },
      ]);
  
      if (formError) {
        console.error('Form submission error:', formError); // Log detailed error for debugging
        Alert.alert('Error', 'Failed to book wedding appointment. Please try again.');
      } else {
        console.log('Wedding form submitted successfully:', weddingFormData);
        Alert.alert('Success', 'Wedding appointment booked successfully.');
        router.back();
      }
    } catch (error) {
      console.error('Unexpected error booking appointment:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };
  
  
  
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Wedding Form</Text>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Bride's Full Name:</Text>
          <TextInput
            style={styles.input}
            value={brideName}
            onChangeText={setBrideName}
            placeholder="Enter Bride's Name"
          />

          <Text style={styles.label}>Groom's Full Name:</Text>
          <TextInput
            style={styles.input}
            value={groomName}
            onChangeText={setGroomName}
            placeholder="Enter Groom's Name"
          />

          <Text style={styles.label}>Contact Number:</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter Contact Number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Wedding Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose a Wedding Date:</Text>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#C69C6D' },
              ...eventDates.reduce(
                (acc, date) => ({ ...acc, [date]: { disabled: true, disableTouchEvent: true, dotColor: 'red' } }),
                {}
              ),
            }}
          />
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleAppointmentBooking}>
          <Text style={styles.submitButtonText}>Book an Appointment</Text>
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

export default WeddingForm;
