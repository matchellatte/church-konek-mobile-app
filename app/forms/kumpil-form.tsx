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

const KumpilForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [ninongName, setNinongName] = useState('');
  const [ninangName, setNinangName] = useState('');
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
    if (!fullName || !guardianName || !contactNumber || !ninongName || !ninangName || !selectedDate) {
      Alert.alert('Validation Error', 'Please fill out all fields and choose a date.');
      return;
    }

    try {
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      const userId = userResponse?.user?.id;

      if (userError || !userId) {
        Alert.alert('Error', 'Failed to retrieve user information. Please try again.');
        return;
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('service_id')
        .eq('name', 'Kumpil')
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

      const { error: formError } = await supabase.from('kumpilforms').insert([
        {
          full_name: fullName,
          guardian_name: guardianName,
          contact_number: contactNumber,
          ninong_name: ninongName,
          ninang_name: ninangName,
          kumpil_date: selectedDate,
          appointment_id: appointmentId,
          status: 'pending',
        },
      ]);

      if (formError) {
        Alert.alert('Booking Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Success', 'Kumpil appointment booked successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar title="Kumpil Form" />
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
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
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
            <FormInputField
              label="Ninong's Name"
              placeholder="Enter Ninong's name"
              value={ninongName}
              onChangeText={setNinongName}
              required
            />
            <FormInputField
              label="Ninang's Name"
              placeholder="Enter Ninang's name"
              value={ninangName}
              onChangeText={setNinangName}
              required
            />
          </View>

          {/* Book Appointment Button */}
          <SubmitButton label="Book Kumpil Appointment" onPress={handleAppointmentBooking} />
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
    ...Platform.select({
      ios: {
        fontSize: 20,
      },
      android: {
        fontSize: 15,
      },
    }),
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginBottom: 15,
  },
});

export default KumpilForm;
