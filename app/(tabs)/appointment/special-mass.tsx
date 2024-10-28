import React from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubmitButton from '../../../components/SubmitButton'; // Adjust the path if needed

interface SpecialMassProps {}

const SpecialMass: React.FC<SpecialMassProps> = () => {
  const router = useRouter();

  // Navigate to the dynamic appointment form with the "Special Mass" service
  const handleAppointmentNavigation = () => {
    router.push('/forms/special-mass-form'); // Ensure this path matches your directory structure
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Special Mass</Text>
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image 
          source={require('../../../assets/images/image12.png')} 
          style={styles.image} 
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements for Special Mass</Text>

          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>
              • What is the mass for? (Death Anniversary, Wedding Anniversary, Birthday)
            </Text>
            <Text style={styles.requirementItem}>• Schedule an appointment</Text>
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
    paddingBottom: 50,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 15,
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
    color: '#6A5D43',
    marginBottom: 10,
  },
  requirementsList: {
    marginTop: 10,
  },
  requirementItem: {
    fontSize: 16,
    color: '#333',
    lineHeight: 28,
    marginBottom: 5,
  },
});

export default SpecialMass;
