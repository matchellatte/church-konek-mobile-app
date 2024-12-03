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

const FuneralMassForm: React.FC = () => {
  const router = useRouter();
  const [deceasedName, setDeceasedName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [eventDates, setEventDates] = useState<string[]>([]);

  useEffect(() => {
    fetchEventDates();
  }, []);

  const fetchEventDates = async () => {
    const { data, error } = await supabase
      .from('event') // Fetch from the event table
      .select('event_date');

    if (error) {
      console.error('Error fetching event dates:', error);
    } else {
      const dates = data.map((item: any) => item.event_date.split('T')[0]); // Extract date part only
      setEventDates(dates);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!deceasedName || !guardianName || !contactNumber || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a funeral mass date.');
      return;
    }

    try {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'Funeral Mass')
        .single();

      if (serviceError || !serviceData) {
        Alert.alert('Error', 'Failed to fetch the service ID for Funeral Mass. Please try again.');
        return;
      }

      const serviceId = serviceData.service_id;

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

      const { error: formError } = await supabase.from('funeralmassforms').insert([
        {
          deceased_name: deceasedName,
          guardian_name: guardianName,
          contact_number: contactNumber,
          funeral_mass_date: selectedDate,
          appointment_id: appointmentId,
        },
      ]);

      if (formError) {
        Alert.alert('Error', 'Failed to book funeral mass appointment. Please try again.');
      } else {
        Alert.alert('Success', 'Funeral mass appointment booked successfully.');
        router.back();
      }
    } catch (error) {
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
        <Text style={styles.navTitle}>Funeral Mass Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Deceased's Name:</Text>
          <TextInput
            style={styles.input}
            value={deceasedName}
            onChangeText={setDeceasedName}
            placeholder="Enter Deceased's Name"
          />

          <Text style={styles.label}>Guardian's Name:</Text>
          <TextInput
            style={styles.input}
            value={guardianName}
            onChangeText={setGuardianName}
            placeholder="Enter Guardian's Name"
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

        {/* Funeral Mass Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose a Funeral Mass Date:</Text>
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

export default FuneralMassForm;
