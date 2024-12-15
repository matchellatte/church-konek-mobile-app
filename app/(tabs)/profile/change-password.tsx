import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the eye icon

const ChangePassword = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        Alert.alert('Error', 'User is not authenticated.');
        setLoading(false);
        return;
      }

      const email = session.user.email;

      // Step 1: Verify old password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Incorrect old password.');
        setLoading(false);
        return;
      }

      // Step 2: Update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert('Error', 'Failed to update the password.');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Password updated successfully.');
      router.push('/'); // Navigate to another screen if necessary
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow Icon */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Ionicons name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.header}>Change Password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Old Password"
          placeholderTextColor="#000" // Black placeholder text
          secureTextEntry={!showOldPassword}
          value={oldPassword}
          onChangeText={setOldPassword}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setShowOldPassword(!showOldPassword)}
          style={styles.showButton}
        >
          <Ionicons name={showOldPassword ? 'eye-off' : 'eye'} size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="New Password"
          placeholderTextColor="#000" // Black placeholder text
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          style={styles.showButton}
        >
          <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#C8A98D' }]} // Light brown button
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF', // White background
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Black text
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000', // Black border color
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFF', // White background
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: '#000', // Black text
  },
  showButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePassword;



