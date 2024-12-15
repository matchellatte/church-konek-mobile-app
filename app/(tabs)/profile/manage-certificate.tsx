import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';  // Import Ionicons for the back arrow icon

const ManageCertificate = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow Icon */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/profile')}  // Navigate back to profile tab
      >
        <Ionicons name="arrow-back" size={30} color="#4E6E7C" /> {/* Ionicons arrow-back */}
      </TouchableOpacity>

      <Text style={styles.header}>Select Certificate Type</Text>
     
      <View style={styles.buttonContainer}>
        {/* Baptismal Certificate Button */}
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={() => router.push('/profile/request-baptismal')}
        >
          <Text style={styles.buttonText}>Baptismal Certificate</Text>
        </TouchableOpacity>

        {/* Confirmation Certificate Button */}
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={() => router.push('/profile/request-confirmation')}
        >
          <Text style={styles.buttonText}>Confirmation Certificate</Text>
        </TouchableOpacity>

        {/* First Communion Certificate Button */}
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={() => router.push('/profile/request-communion')}
        >
          <Text style={styles.buttonText}>First Communion Certificate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF', // White background
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,  // Space for header
    textAlign: 'center',
    color: '#4E6E7C',  // Darker brown for the header text
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  certificateButton: {
    backgroundColor: '#C8A98D', // Light brown for buttons
    padding: 15,
    borderRadius: 25, // Rounded corners for the buttons
    alignItems: 'center',
    marginVertical: 15,
    width: '80%',
  },
  backButton: {
    position: 'absolute', // Position the back button at the top-left
    top: 40,  // Adjust top margin for better placement
    left: 20, // Position it on the left
    zIndex: 1, // Ensure it appears on top of other elements
    padding: 10, // Add some padding to the button
  },
  buttonText: {
    color: '#fff',  // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManageCertificate;



