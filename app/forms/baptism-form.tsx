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

const BaptismForm: React.FC = () => {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('date')
      .eq('status', 'Available');
    if (error) {
      console.log('Error fetching available dates:', error);
    } else {
      const dates = data.map((item: any) => item.date);
      setAvailableDates(dates);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!childName || !parentName || !contactNumber || !selectedDate) {
      Alert.alert('Please fill out all fields and choose a baptism date.');
      return;
    }

    const { data, error } = await supabase.from('baptism_appointments').insert([
      {
        child_name: childName,
        parent_name: parentName,
        contact_number: contactNumber,
        baptism_date: selectedDate,
        status: 'Pending Approval',
      },
    ]);

    if (error) {
      Alert.alert('Error booking appointment. Please try again.');
    } else {
      Alert.alert('Appointment booked successfully. Awaiting approval.');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Baptism Form</Text>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Name of Child:</Text>
          <TextInput
            style={styles.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Enter Child's Name"
          />

          <Text style={styles.label}>Parent/Guardian's Name:</Text>
          <TextInput
            style={styles.input}
            value={parentName}
            onChangeText={setParentName}
            placeholder="Enter Parent/Guardian's Name"
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

        {/* Baptism Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose a Baptism Date:</Text>
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

export default BaptismForm;
