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
import SubmitButton from '../../../components/SubmitButton'; // Update the path as needed

interface FirstCommunionProps {}

const FirstCommunion: React.FC<FirstCommunionProps> = () => {
  const router = useRouter();

  const handleAppointmentNavigation = () => {
    router.push('/forms/FirstCommunion'); // Update the path based on your structure
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar with Back Button */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>First Communion</Text>
      </View>

      {/* Scrollable Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image 
          source={require('../../../assets/images/image10.png')} 
          style={styles.image} 
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements for School First Communion</Text>

          {/* Requirements List */}
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>
              • Catechist will coordinate with the principal
            </Text>
            <Text style={styles.requirementItem}>
              • Applies once the child is in grade 4
            </Text>
            <Text style={styles.requirementItem}>
              • Required: Baptismal and birth certificates
            </Text>
            <Text style={styles.requirementItem}>
              • No need to submit student count forms
            </Text>
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
    paddingBottom: 100, // Prevent overlap with other content
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
    textAlign: 'left',
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

export default FirstCommunion;
