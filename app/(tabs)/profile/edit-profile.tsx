import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../backend/lib/supabase';

// Define the type for Prayer Intention
interface PrayerIntention {
  prayer_intention_id: string;
  user_id: string;
  full_name: string;
  contact_number: string;
  prayer_text: string;
  status: string;
}

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>(''); // Explicitly typed as string
  const [loading, setLoading] = useState<boolean>(false); // Explicitly typed as boolean
  const [error, setError] = useState<string>(''); // Error message for validation

  const loadUserInfo = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error('Unable to fetch user data.');
      
      setFullName(user.user_metadata.full_name || '');
    } catch (error: any) {
      handleError(error, 'Failed to load user information.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Reset error message

      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) {
        throw error;
      }

      // Check if data is updated
      console.log('Updated user data:', data);

      Alert.alert('Success', 'Profile updated successfully.');
      router.push('/profile');
    } catch (error: any) {
      handleError(error, 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any, fallbackMessage: string) => {
    console.error(error); // For debugging purposes
    const message = error?.message || fallbackMessage;
    setError(message);
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            onFocus={() => setError('')} // Reset error when focused
            accessible
            accessibilityLabel="Full Name Input"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button as a light brown container button */}
        <TouchableOpacity
          style={styles.cancelButtonContainer}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Lighter background for better contrast
    justifyContent: 'center',  // Centers content vertically
    alignItems: 'center',      // Centers content horizontally
  },
  content: {
    width: '80%',  // Limits width to 80% of the screen
    maxWidth: 400, // Optional: adds a max-width for larger screens
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    color: '#555', // Slightly lighter gray for better readability
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC', // Softer border color
    borderRadius: 10, // Rounded corners for modern look
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF', // White background for input fields
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#E74C3C', // Red border for errors
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C8A98D', // Light brown button color
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7', // Disabled button color
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButtonContainer: {
    backgroundColor: '#C8A98D', // Light brown color for cancel button
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',  // Make it a full-width button
  },
  cancelButtonText: {
    color: '#FFFFFF', // White text for better contrast
    fontSize: 18, // Same font size as the Save button
    fontWeight: '600', // Same font weight as the Save button
  },
});

export default EditProfile;


