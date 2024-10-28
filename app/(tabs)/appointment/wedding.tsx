import React from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For chevron-back icon
import { useRouter } from 'expo-router';
import SubmitButton from '../../../components/SubmitButton'; // Update path if needed

interface WeddingProps {}

const Wedding: React.FC<WeddingProps> = () => {
  const router = useRouter();

  // Navigate to the WeddingForm with service configuration
  const handleAppointmentNavigation = () => {
    router.push('/forms/wedding-form'); // Adjusted to directly match the route
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Wedding</Text>
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={require('../../../assets/images/image4.png')} style={styles.image} />

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements for Bride and Groom</Text>

          <View style={styles.subSection}>
            <Text style={styles.subHeader}>Seminar Pre-Cana</Text>
            <Text style={styles.description}>
              If you haven't attended a Pre-Cana Seminar, you can schedule an appointment.
            </Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Book Pre-Cana Appointment</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subHeader}>Required Documents</Text>
            <View style={styles.requirementsList}>
              {[
                'Baptismal Certificate',
                'Birth Certificate',
                'Confirmation Certificate',
                'Marriage Bond',
                'Seminar Pre-Cana',
              ].map((item, index) => (
                <Text key={index} style={styles.requirementItem}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Appointment Button */}
        <SubmitButton 
          label="Make an Appointment" 
          onPress={handleAppointmentNavigation} 
        />
      </ScrollView>
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
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
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
  subSection: {
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5D43',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#C69C6D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requirementsList: {
    paddingHorizontal: 10,
  },
  requirementItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default Wedding;
