import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';
import ServiceTile from '../../components/appointment-components/service-tile';
import AppointmentCard from '../../components/appointment-components/appointment-card';
import SectionHeader from '../../components/appointment-components/section-header';

const services = [
  { label: 'Wedding', icon: require('../../assets/icons/wedding_icon.png'), screen: '/appointment/wedding' },
  { label: 'Baptism', icon: require('../../assets/icons/baptism_icon.png'), screen: '/appointment/baptism' },
  { label: 'Kumpil', icon: require('../../assets/icons/kumpil_icon.png'), screen: '/appointment/kumpil' },
  { label: 'Funeral Mass', icon: require('../../assets/icons/funeral_mass_icon.png'), screen: '/appointment/funeral-mass' },
  { label: 'House Blessing', icon: require('../../assets/icons/house_blessing_icon.png'), screen: '/appointment/house-blessing' },
  { label: 'First Communion', icon: require('../../assets/icons/first_communion_icon.png'), screen: '/appointment/first-communion' },
  { label: 'Special Mass', icon: require('../../assets/icons/special_mass_icon.png'), screen: '/appointment/special-mass' },
  { label: 'Prayer Intention', icon: require('../../assets/icons/prayer_intention_icon.png'), screen: '/appointment/prayer-intention' },
  { label: 'Church Donation', icon: require('../../assets/icons/donation_icon.png'), screen: '/appointment/church-donation' },
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
      const formattedAppointments = data.map((appointment: any) => {
        const formattedDate = new Date(appointment.appointment_date)
          .toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          });
        return {
          id: appointment.appointment_id,
          type: appointment.services.name,
          date: formattedDate,
          status: appointment.status,
        };
      });
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
          <Text style={styles.description}>Select a service to schedule your appointments.</Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <ServiceTile
              key={index}
              label={service.label}
              icon={service.icon}
              onPress={() => router.push(service.screen as any)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <SectionHeader
          title="Appointments"
          onSeeAll={() => router.push('/all-appointments')}
        />

        {appointments.map((appointment, index) => (
          <AppointmentCard
            key={index}
            type={appointment.type}
            date={appointment.date}
            status={appointment.status}
            onPress={() =>
              router.push(
                `/appointment/appointment-details?appointmentId=${appointment.id}&appointmentType=${appointment.type}`
              )
            }
          />
        ))}

        {appointments.length === 0 && (
          <Text style={styles.noAppointmentsText}>No appointments yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 25,
  },
  title: {
    ...Platform.select({
      ios: {
          fontSize: 28,
      },
      android: {
          fontSize: 22,
      },
  }),
    fontWeight: '700',
    color: '#333',
  },
  description: {
    ...Platform.select({
      ios: {
          fontSize: 16,
      },
      android: {
          fontSize: 12,
      },
  }),
    color: '#6B7280',
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
    height: 110,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B3F3A',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E0',
    marginVertical: 15,
  },
  appointmentsSection: {
    marginTop: 0,
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
    color: '#4B3F3A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF', // White card for better contrast
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row', // Align content horizontally
    alignItems: 'center',
  },
  calendarIcon: {
    backgroundColor: '#F9F5F0', // Beige tone for icon background
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 16,
    color: '#5A4A3A', // Rich brown text
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#857F72', // Subtle gray-brown
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: '#A57A5A', // Beige-brown for badge
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  
});

export default Appointment;
