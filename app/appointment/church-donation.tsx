import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ChurchDonation: React.FC = () => {
  const router = useRouter();

  const navigateToUpload = () => {
    router.push('/appointment/upload-donation'); // Adjust the route to match your upload screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Title and QR Code Section */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Church Donation</Text>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Image
            source={require('../../assets/images/gcash-qr.png')} // Adjust the path as necessary
            style={styles.qrImage}
          />
        </View>

        {/* Thank You Message */}
        <Text style={styles.thankYouText}>Thank you for your generosity!</Text>

        {/* Navigate to Upload Button */}
        <TouchableOpacity style={styles.uploadButton} onPress={navigateToUpload}>
          <Text style={styles.uploadButtonText}>Upload Donation Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // Softer background color for a calming effect
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, // Larger font for better readability
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center', // Centered for visual appeal
  },
  qrSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  qrImage: {
    width: 400, // Increased size for a larger QR code
    height: 400,
    resizeMode: 'contain',
    marginBottom: 20, // Added space below the QR code
  },
  thankYouText: {
    fontSize: 20, // Larger font for clarity
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center', // Centered to keep the layout consistent
  },
  uploadButton: {
    backgroundColor: '#D2B48C', // Light brown button color
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ChurchDonation;
