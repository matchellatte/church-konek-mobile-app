import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import SubmitButton from '../../components/SubmitButton';
import TopNavbar from '../../components/top-navbar';
import FormInputField from '../../components/form-input-field';
import { supabase } from '../../backend/lib/supabase';

const PrayerIntention: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [intention, setIntention] = useState('');

  const handleSubmit = async () => {
    if (!fullName || !contactNumber || !intention) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Unable to retrieve user information. Please try again.');
        return;
      }

      const { error } = await supabase.from('prayerintentionforms').insert([
        {
          user_id: user.id,
          full_name: fullName,
          contact_number: contactNumber,
          prayer_text: intention,
          status: 'pending',
        },
      ]);

      if (error) {
        Alert.alert('Submission Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Thank You', 'Your prayer intention has been submitted.');
        router.back();
      }
    } catch (error) {
      Alert.alert('Submission Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TopNavbar title="Prayer Intention" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Contact Information Section */}
          <View style={styles.section}>
            <FormInputField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              required
            />
            <FormInputField
              label="Contact Number"
              placeholder="Enter your contact number"
              value={contactNumber}
              onChangeText={setContactNumber}
              required
              keyboardType="phone-pad"
            />
          </View>

          {/* Prayer Intention Section */}
          <View style={styles.section}>
            <FormInputField
              label="Your Prayer Intention"
              placeholder="Enter your prayer intention..."
              value={intention}
              onChangeText={setIntention}
              required
              multiline
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <SubmitButton label="Submit Prayer" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default PrayerIntention;
