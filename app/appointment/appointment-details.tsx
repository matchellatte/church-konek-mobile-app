import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/backend/lib/supabase';
import AppointmentTopNavbar from '../../components/appointment-details/details-navbar';
import ProgressBar from '../../components/appointment-details/progress-bar';

const AppointmentDetails: React.FC = () => {
  const { appointmentId: rawAppointmentId } = useLocalSearchParams();
  const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId;
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [relatedForm, setRelatedForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);

    try {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .eq('appointment_id', appointmentId)
        .single();

      if (appointmentError || !appointmentData) {
        Alert.alert('Error', 'Failed to fetch appointment details.');
        return;
      }

      setAppointment(appointmentData);

      if (appointmentData.type) {
        if (typeof appointmentData.type === 'string') {
          await fetchRelatedForm(appointmentData.type, appointmentId);
        }
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedForm = async (type: string, id: string) => {
    let tableName = '';

    switch (type.toLowerCase()) {
      case 'kumpil':
        tableName = 'kumpilforms';
        break;
      case 'wedding':
        tableName = 'weddingforms';
        break;
      case 'baptism':
        tableName = 'baptismforms';
        break;
      default:
        return;
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('appointment_id', id)
        .single();

      if (error) {
        Alert.alert('Error', `Failed to fetch details from ${tableName}.`);
      } else {
        const filteredData = Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
          if (!key.includes('id')) acc[key] = value;
          return acc;
        }, {});
        setRelatedForm(filteredData);
      }
    } catch (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading appointment details...</Text>
      </SafeAreaView>
    );
  }

  const renderRelatedForm = () => {
    if (!relatedForm) return null;

    return (
      <View style={styles.relatedFormContainer}>
        <Text style={styles.sectionHeader}>Additional Details</Text>
        {Object.entries(relatedForm).map(([key, value], index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{key.replace(/_/g, ' ')}:</Text>
            <Text style={styles.detailValue}>{String(value) || 'N/A'}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContentByStatus = () => {
    const { status, appointment_date, services } = appointment;
    const date = new Date(appointment_date);
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let infoText = '';
    let buttonText = '';
    let buttonDisabled = false;
    let progress = 0.5;

    switch (status) {
      case 'pending':
        infoText = 'Your appointment is pending for approval.';
        buttonText = 'Pending';
        buttonDisabled = true;
        break;
      case 'pending for requirements':
        infoText = 'Your appointment is approved and pending for requirements.';
        buttonText = 'Continue';
        buttonDisabled = false;
        break;
      case 'pending for approval':
        infoText = 'You have successfully uploaded the requirements.';
        buttonText = 'Pending for Approval';
        buttonDisabled = true;
        break;
      case 'cancelled':
        infoText = 'This appointment has been cancelled.';
        buttonText = 'Cancelled';
        buttonDisabled = true;
        progress = 1;
        break;
      case 'completed':
        infoText = 'This appointment is completed. Thank you!';
        buttonText = 'Completed';
        buttonDisabled = true;
        progress = 1;
        break;
      case 'approved':
          infoText = 'This appointment is approved. Please proceed to the church on the scheduled date.';
          buttonText = 'Approved';
          buttonDisabled = true;
          progress = 1;
        break;
      default:
        infoText = 'Your appointment status is unknown.';
        buttonText = 'N/A';
        buttonDisabled = true;
    }

    return (
      <>
        <ProgressBar progress={progress} />

        <Text style={styles.sectionHeader}>Appointment Details</Text>
        <View style={styles.row}>
          <View style={styles.calendarBox}>
            <Text style={styles.calendarDay}>{day}</Text>
            <Text style={styles.calendarMonth}>{month}</Text>
            <Text style={styles.calendarYear}>{year}</Text>
          </View>
          <Text style={styles.typeText}>{services?.name || 'N/A'}</Text>
        </View>

        <Text style={styles.infoText}>{infoText}</Text>

        {renderRelatedForm()}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { opacity: buttonDisabled ? 0.6 : 1 },
          ]}
          disabled={buttonDisabled}
          onPress={() => {
            if (!buttonDisabled && status === 'pending for requirements') {
              router.push(`/appointment/upload-requirements?appointmentId=${appointmentId}`);
            }
          }}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppointmentTopNavbar title="Appointment Booking" />
      <ScrollView contentContainerStyle={styles.content}>
        {renderContentByStatus()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarBox: {
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 80,
    height: 85,
  },
  calendarDay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  calendarMonth: {
    fontSize: 16,
    color: '#6B7280',
  },
  calendarYear: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  relatedFormContainer: {
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AppointmentDetails;
