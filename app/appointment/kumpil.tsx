import React from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TransparentTopNavbar from '../../components/transparent-top-navbar';
import { useRouter } from 'expo-router';

const Kumpil: React.FC = () => {
  const router = useRouter();

  const handleAppointmentNavigation = () => {
    router.push('/forms/kumpil-form');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/kumpil_banner.png')}
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
          style={styles.gradientOverlay}
        />
        <TransparentTopNavbar title="Kumpil" />
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Requirements Section */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.sectionTitle}>Requirements for Kumpil</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>• Baptismal Certificate</Text>
            <Text style={styles.requirementItem}>• Birth Certificate</Text>
            <Text style={styles.requirementItem}>• Ninong and Ninang Requirements</Text>
            <Text style={styles.requirementItem}>• Confirmation Certificate</Text>
            <Text style={styles.requirementItem}>• Marriage Contract (if married)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Appointment Button */}
      <View style={styles.footerButtonContainer}>
        <TouchableOpacity style={styles.appointmentButton} onPress={handleAppointmentNavigation}>
          <Text style={styles.buttonText}>Book an Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 2,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  scrollContent: {
    ...Platform.select({
      ios: {
        marginTop: 200,
      },
      android: {
        marginTop: 250,
      },
    }),
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  requirementsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginTop: 20,
    padding: 20,
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
    marginBottom: 10,
  },
  requirementsList: {
    marginTop: 10,
  },
  requirementItem: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 11,
      },
    }),
    color: '#4B3F3A',
    marginBottom: 8,
  },
  footerButtonContainer: {
    ...Platform.select({
      ios: {
        bottom: 20,
      },
      android: {
        bottom: 0,
      },
    }),
    position: 'absolute',
    left: 15,
    right: 15,
  },
  appointmentButton: {
    ...Platform.select({
      ios: {
        paddingVertical: 18,
      },
      android: {
        paddingVertical: 13,
      },
    }),
    backgroundColor: '#A57A5A',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Kumpil;