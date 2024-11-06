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

const FuneralMassForm: React.FC = () => {
  const router = useRouter();
  const [deceasedName, setDeceasedName] = useState('');
  const [guardianName, setGuardianName] = useState('');
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
      .eq('status', 'available');
      
    if (error) {
      console.log('Error fetching available dates:', error);
    } else {
      const dates = data.map((item: any) => item.appointment_date);
      setAvailableDates(dates);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!deceasedName || !guardianName || !contactNumber || !selectedDate) {
      Alert.alert('Please fill out all fields and choose a funeral mass date.');
      return;
    }

    try {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }

      // Step 1: Create an Appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            service_id: (await supabase.from('services').select('service_id').eq('name', 'Funeral Mass').single()).data?.service_id,
            appointment_date: selectedDate,
            status: 'pending'
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

      // Step 2: Insert into FuneralMassForms table with the generated appointment_id
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
        console.error('Form submission error:', formError);
        Alert.alert('Error', 'Failed to book funeral mass appointment. Please try again.');
      } else {
        Alert.alert('Success', 'Funeral mass appointment booked successfully.');
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
        <Text style={styles.title}>Funeral Mass Form</Text>

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
              ...availableDates.reduce(
                (acc, date) => ({ ...acc, [date]: { marked: true, dotColor: '#C69C6D' } }),
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

export default FuneralMassForm;
