import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase'; // Adjust path as needed

const services = [
  { label: 'Wedding', icon: 'heart-outline', screen: '/appointment/wedding' },
  { label: 'Baptism', icon: 'water-outline', screen: '/appointment/baptism' },
  { label: 'Funeral Mass', icon: 'flower-outline', screen: '/appointment/funeral-mass' },
  { label: 'House Blessing', icon: 'home-outline', screen: '/appointment/house-blessing' },
  { label: 'First Communion', icon: 'book-outline', screen: '/appointment/first-communion' },
  { label: 'Kumpil', icon: 'hand-left-outline', screen: '/appointment/kumpil' },
  { label: 'Special Mass', icon: 'musical-note-outline', screen: '/appointment/special-mass' },
  { label: 'Prayer Intention', icon: 'chatbox-ellipses-outline', screen: '/appointment/prayer-intention' },
  { label: 'Church Donation', icon: 'cash-outline', screen: '/appointment/church-donation' },
];

const Appointment = () => {
  const router = useRouter();
  interface Appointment {
    id: number;
    title: string;
    wedding_date: string;
    status: string;
    type: string;
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
    
    // Listen to real-time changes in the appointments table
    const channel = supabase.channel('wedding_appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wedding_appointments' }, () => fetchAppointments())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wedding_appointments' }, () => fetchAppointments())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      Alert.alert('Error', 'Failed to retrieve user information');
    } else if (user) {
      setUserId(user.id);
    }
  };

  const fetchAppointments = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('wedding_appointments')
      .select('*')
      .eq('user_id', userId) // Use user_id instead of id
      .order('wedding_date', { ascending: false });

    if (error) {
      Alert.alert('Error fetching appointments', error.message);
    } else {
      const updatedData = data.map((appointment: any) => ({
        ...appointment,
        type: 'Wedding Appointment',
      }));
      setAppointments(updatedData);
    }
  };

  const handleNavigate = (screen: string) => {
    router.push(screen as any);
  };

  const handleAppointmentClick = (appointmentId: number) => {
    router.push({
      pathname: '/appointment/wedding-appointment-details',
      params: { appointmentId: appointmentId.toString() },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Book an Appointment</Text>
          <Text style={styles.description}>
            Select a service to schedule or view your appointments.
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceTile}
              onPress={() => handleNavigate(service.screen)}
            >
              <Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={34} color="#333" />
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Appointment Details Section */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>Appointments</Text>

          {appointments.length === 0 ? (
            <Text style={styles.noAppointmentsText}>No appointments yet</Text>
          ) : (
            appointments.map((appointment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.appointmentCard}
                onPress={() => handleAppointmentClick(appointment.id)}
              >
                <View style={styles.appointmentContent}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                    <Text style={styles.appointmentDate}>{appointment.wedding_date}</Text>
                  </View>
                  <Text style={styles.appointmentStatus}>{appointment.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#545454',
    marginTop: 5,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceTile: {
    width: '30%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  serviceLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  appointmentsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default Appointment;
