import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const HomePage = () => {
  const router = useRouter(); // Use Expo Router
  const [userName] = useState('Grechelle Ann');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (screen: '/' | '/appointment' | '/calendar' | '/profile') => {
    router.push(screen); // Use router.push for navigation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.navbar}>
          <Text style={styles.greeting}>Hi {userName}!</Text>
          <Ionicons name="notifications-outline" size={28} color="#333333" />
        </View>

        <Text style={styles.tagline}>Bringing the Church closer to you!</Text>

        <TextInput
          style={styles.searchBar}
          placeholder="Search for an appointment..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Image source={require('../../assets/images/image1.png')} style={styles.bannerImage} />

        {/* Services Section */}
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceTile}
              onPress={() => handleNavigate(service.screen)}
            >
              <Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={32} color="#333333" />
              <View style={styles.serviceTextContainer}>
                <Text
                  style={[
                    styles.serviceTitle,
                    service.title === 'Book Appointment' && styles.boldText,
                  ]}
                >
                  {service.title}
                </Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Church Events Section */}
        <View style={styles.container}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Church Events</Text>
            <TouchableOpacity onPress={() => handleNavigate('/calendar')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {churchEvents.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Mass Schedule Section */}
        <View style={styles.container}>
          <Text style={styles.subSectionTitle}>Mass Schedule</Text>
          {massSchedule.map((item, index) => (
            <View key={index} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text style={styles.scheduleTime}>{item.time}</Text>
            </View>
          ))}
        </View>

        {/* About Church Section */}
        <View style={styles.container}>
          <Text style={styles.subSectionTitle}>About Church</Text>
          <Text style={styles.churchInfo}>
            <Text style={styles.boldText}>Blessed Virgin Mary, Queen of The World Parish</Text>
            {'\n'}
            Established in 1971, the parish was carved from the parish of St. John the Baptist. The
            pioneering parish priest was Fr. Armando Perez, who built the church and rectory.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const services: { title: string; description: string; icon: string; screen: '/' | '/appointment' | '/calendar' | '/profile' }[] = [
  { title: 'Book Appointment', description: 'Schedule a meeting.', icon: 'calendar-outline', screen: '/appointment' },
  { title: 'Request Certificate', description: 'Get certificates.', icon: 'document-text-outline', screen: '/' },
  { title: 'Prayer Intention', description: 'Let us pray.', icon: 'heart-outline', screen: '/calendar' },
  { title: 'Donate to Church', description: 'Support us.', icon: 'cash-outline', screen: '/profile' },
];

const churchEvents = [
  { date: 'Oct 15', title: 'Baptism Ceremony' },
  { date: 'Oct 17', title: 'Wedding Ceremony' },
  { date: 'Oct 20', title: 'Special Mass' },
];

const massSchedule = [
  { day: 'Monday', time: '6:30 AM, 12:00 PM' },
  { day: 'Tuesday', time: '6:30 AM, 12:00 PM' },
  { day: 'Wednesday', time: '6:30 AM, 12:00 PM' },
  { day: 'Thursday', time: '6:30 AM, 12:00 PM' },
  { day: 'Friday', time: '6:30 AM, 12:00 PM' },
  { day: 'Saturday', time: '8:00 AM' },
  { day: 'Sunday', time: '8:00 AM, 10:30 AM, 5:00 PM' },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333333',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceTile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  serviceTextContainer: {
    marginTop: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#FFF5EB',
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    width: 150,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C69C6D',
  },
  eventTitle: {
    fontSize: 14,
    color: '#333',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  scheduleDay: {
    fontSize: 14,
    color: '#333',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  churchInfo: {
    fontSize: 14,
    color: '#545454',
  },
  boldText: {
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6A5D43',
    fontWeight: 'bold',
  },
});

export default HomePage;
