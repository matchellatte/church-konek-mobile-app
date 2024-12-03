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
import { supabase } from '../../backend/lib/supabase';

const AllAppointments = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAllAppointments();
    }
  }, [userId]);

  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      Alert.alert('Error', 'Failed to retrieve user information');
    } else if (data.user) {
      setUserId(data.user.id);
    }
  };

  const fetchAllAppointments = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: false });

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>All Appointments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {appointments.length === 0 ? (
          <Text style={styles.noAppointmentsText}>No appointments yet</Text>
        ) : (
          appointments.map((appointment, index) => (
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  appointmentCard: {
    backgroundColor: '#E6F4F1',
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

export default AllAppointments;
