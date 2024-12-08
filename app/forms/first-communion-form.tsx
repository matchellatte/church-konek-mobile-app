import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  Platform,
  View,
  Text,
} from 'react-native';
import { supabase } from '../../backend/lib/supabase';
import SubmitButton from '../../components/SubmitButton';
import TopNavbar from '../../components/top-navbar';
import CalendarDatePicker from '../../components/calendar-date-picker';
import FormInputField from '../../components/form-input-field';

const FirstCommunionForm: React.FC = () => {
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
    try {
      const { data, error } = await supabase.from('event').select('event_date');
      if (error) throw error;

      const dates = data.map((item: any) => item.event_date.split('T')[0]);
      setEventDates(dates);
    } catch (error) {
      Alert.alert('Error', 'Failed to load unavailable dates. Please try again later.');
    }
  };

  const handleAppointmentBooking = async () => {
    if (!childName || !birthday || !guardianName || !contactNumber || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a date.');
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
        .eq('name', 'First Communion')
        .single();

      if (serviceError || !serviceData) {
        Alert.alert('Error', 'Failed to fetch the service ID. Please try again.');
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

      const { error: formError } = await supabase.from('firstcommunionforms').insert([
        {
          child_name: childName,
          birthday: birthday,
          guardian_name: guardianName,
          contact_number: contactNumber,
          communion_date: selectedDate,
          appointment_id: appointmentId,
        },
      ]);

      if (formError) {
        Alert.alert('Error', 'Failed to book First Communion appointment. Please try again.');
      } else {
        Alert.alert('Success', 'First Communion appointment booked successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar title="First Communion Form" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Calendar Section */}
          <CalendarDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            eventDates={eventDates}
          />

          {/* Personal Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <FormInputField
              label="Child's Full Name"
              placeholder="Enter child's full name"
              value={childName}
              onChangeText={setChildName}
              required
            />
            <FormInputField
              label="Birthday"
              placeholder="Enter birthday (YYYY-MM-DD)"
              value={birthday}
              onChangeText={setBirthday}
              required
            />
            <FormInputField
              label="Guardian's Name"
              placeholder="Enter guardian's name"
              value={guardianName}
              onChangeText={setGuardianName}
              required
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
          <SubmitButton label="Book First Communion" onPress={handleAppointmentBooking} />
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
    padding: 10,
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

export default FirstCommunionForm;
