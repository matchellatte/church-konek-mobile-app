import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, View, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Calendar picker
import { supabase } from '../../../backend/lib/supabase';
import { useRouter } from 'expo-router';

const RequestBaptismal = () => {
  const router = useRouter();
  const [name, setName] = useState(''); // Name of baptized
  const [selectedDate, setSelectedDate] = useState(''); // Date of baptism
  const [details, setDetails] = useState(''); // Name of the priest or other details
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !selectedDate) {
      Alert.alert('Error', 'Please provide all required fields.');
      return;
    }

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to request a certificate.');
        return;
      }

      const { email } = user.user;

      const { error } = await supabase.from('certificate_requests').insert({
        email,
        certificate_type: 'Baptismal',
        date_of_baptism: selectedDate,
        details: `Name: ${name}, Priest Name/Other Info: ${details}`,
        status: 'Pending',
      });

      if (error) throw error;

      Alert.alert('Success', 'Your request has been submitted.');
      setName('');
      setDetails('');
      setSelectedDate('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile/manage-certificate'); // Navigate back to manage-certificate screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Baptismal Certificate Request</Text>

        <Text style={styles.label}>Name of Baptized:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Date of Baptism:</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#C8A98D', // Light brown for selected date
            },
          }}
          theme={{
            selectedDayBackgroundColor: '#C8A98D',
            todayTextColor: '#00adf5',
            arrowColor: '#007BFF',
          }}
        />
        <Text style={styles.dateText}>
          {selectedDate ? `Selected Date: ${selectedDate}` : 'No date selected'}
        </Text>

        <Text style={styles.label}>Name of Priest or Other Details:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name of priest or any other details"
          value={details}
          onChangeText={setDetails}
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#C8A98D', // Light brown for the button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7', // Disabled button color
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#C8A98D', // Light brown color for the Cancel button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestBaptismal;



