import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../backend/lib/supabase'; // Import Supabase client
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const HomePage = () => {
  const router = useRouter(); // Use Expo Router
  const [userName] = useState('Grechelle Ann');
  const [searchQuery, setSearchQuery] = useState('');
  interface MassSchedule {
    id: number;
    day: string;
    time: string;
  }
  
  const [massSchedule, setMassSchedule] = useState<MassSchedule[]>([]);
  interface ChurchEvent {
    id: number;
    title: string;
    date: string;
  }

  const [churchEvents, setChurchEvents] = useState<ChurchEvent[]>([]);

  // Fetch mass schedule from Supabase
  const fetchMassSchedule = async () => {
    const { data, error } = await supabase
      .from('mass_schedule')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching mass schedule:', error);
    } else {
      setMassSchedule(data);
    }
  };

  // Fetch church events from Supabase
  const fetchChurchEvents = async () => {
    const { data, error } = await supabase
      .from('church_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching church events:', error);
    } else {
      setChurchEvents(data);
    }
  };

  useEffect(() => {
    fetchMassSchedule();
    fetchChurchEvents();
  }, []);

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
                <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
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
