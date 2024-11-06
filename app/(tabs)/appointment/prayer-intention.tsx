import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubmitButton from '../../../components/SubmitButton';
import { supabase } from '../../../backend/lib/supabase';

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
      // Fetch the current user's ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Unable to retrieve user information. Please try again.');
        return;
      }

      // Insert prayer intention with user_id into the database
      const { data, error } = await supabase.from('prayerintentionforms').insert([
        {
          user_id: user.id, // Store user_id
          full_name: fullName,
          contact_number: contactNumber,
          prayer_text: intention,
          status: 'pending',
        },
      ]);

      if (error) {
        console.error('Error submitting prayer intention:', error);
        Alert.alert('Submission Failed', 'An error occurred. Please try again.');
      } else {
        Alert.alert('Thank You', 'Your prayer intention has been submitted.');
        router.back();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Submission Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Prayer Intention</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.fieldLabel}>Contact Number</Text>
          <TextInput
            style={[styles.input]}
            placeholder="Enter contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* Prayer Intention Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Your Prayer Intention</Text>
          <Text style={styles.sectionDescription}>
            Let us pray for you. Please share your prayer intention below.
          </Text>

          <Text style={styles.fieldLabel}>Your Prayer Intention</Text>
          <TextInput
            style={[styles.input, styles.prayerInput]}
            placeholder="Enter your prayer intention..."
            value={intention}
            onChangeText={setIntention}
            multiline
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.fixedButtonContainer}>
        <SubmitButton label="Submit Prayer" onPress={handleSubmit} />
      </View>
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
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    minHeight: 40,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  prayerInput: {
    minHeight: 100, // Larger input area for prayer intention
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
});

export default PrayerIntention;
