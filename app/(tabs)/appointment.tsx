import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';

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
  const [appointments, setAppointments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }

    const channel = supabase
      .channel('appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, fetchAppointments)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, fetchAppointments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      Alert.alert('Error', 'Failed to retrieve user information');
    } else if (data.user) {
      setUserId(data.user.id);
    }
  };

  const fetchAppointments = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      Alert.alert('Error fetching appointments', error.message);
    } else {
      const formattedAppointments = data.map((appointment: any) => ({
        id: appointment.appointment_id,
        type: appointment.services.name,
        date: appointment.appointment_date,
        status: appointment.status,
      }));
      setAppointments(formattedAppointments);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    router.push(
      `/appointment/appointment-details?appointmentId=${appointment.id}&appointmentType=${appointment.type}` as any
    );
  };

  const handleNavigate = (screen: string) => {
    router.push(screen as any);
  };

  const handleSeeAllAppointments = () => {
    router.push('/all-appointments' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Book an Appointment</Text>
          <Text style={styles.description}>
            Select a service to schedule or view your appointments.
          </Text>
        </View>

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

        <View style={styles.divider} />

        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <TouchableOpacity onPress={handleSeeAllAppointments}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {appointments.slice(0, 3).map((appointment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.appointmentCard}
              onPress={() => handleAppointmentClick(appointment)}
            >
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentType}>{appointment.type}</Text>
                  <Text style={styles.appointmentDate}>{appointment.date}</Text>
                </View>
                <Text style={styles.appointmentStatus}>{appointment.status}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {appointments.length === 0 && (
            <Text style={styles.noAppointmentsText}>No appointments yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Subtle off-white background for the overall layout
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Space for scrolling
  },
  headerContainer: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28, // Larger title for emphasis
    fontWeight: '700',
    color: '#2C3E50', // Dark navy for the main title
  },
  description: {
    fontSize: 16,
    color: '#4A5568', // Muted gray for secondary text
    marginTop: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  serviceTile: {
    width: '30%',
    backgroundColor: '#FFF', // Light gray-blue for the tiles
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50', // Dark navy for text inside tiles
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E0', // Subtle divider color
    marginVertical: 20,
  },
  appointmentsSection: {
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3182CE', // Light blue for the "See All" button
    fontWeight: '600',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 20,
  },
  appointmentCard: {
    backgroundColor: '#E6F4F1', // Light greenish-blue for the cards
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#4A5568',
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#6A5D43', // Neutral warm brown for status
    fontWeight: '600',
  },
});


export default Appointment;
