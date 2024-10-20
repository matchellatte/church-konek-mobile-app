import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubmitButton from '../../../components/SubmitButton'; // Adjust the path if necessary

const ChurchDonation: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');

  const handleDonate = () => {
    Alert.alert('Thank You', 'Your donation has been received.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Donate to Church</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Donation Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support the Church</Text>
          <Text style={styles.sectionDescription}>
            Your generous donations help sustain our church and its mission. 
            Please provide your details below and the amount you'd like to donate.
          </Text>
        </View>

        {/* Donation Form Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Donor Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={donorName}
            onChangeText={setDonorName}
          />

          <Text style={styles.fieldLabel}>Donation Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount (e.g., 100)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      {/* Submit Button - Positioned Above the Bottom Navigation */}
      <View style={styles.fixedButtonContainer}>
        <SubmitButton label="Donate" onPress={handleDonate} />
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
    paddingBottom: 80, // Leave space for the fixed button
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
    marginBottom: 15,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 80, // Adjust height to position above the bottom tabs
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
});

export default ChurchDonation;
