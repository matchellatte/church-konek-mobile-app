import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../backend/lib/supabase';

const WeddingAppointmentDetails = () => {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams();
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      console.log("Fetching details for appointmentId:", appointmentId); // Log appointmentId
      fetchAppointmentDetails();
    } else {
      console.warn("No appointmentId provided");
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('weddingforms')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching details:", error);
      Alert.alert('Error fetching appointment details', error.message);
    } else if (!data) {
      console.warn("No details found for this appointmentId:", appointmentId); // Log if no data
      Alert.alert('No details found', 'No wedding appointment details found for this ID.');
    } else {
      setAppointmentDetails(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileName = `${documentType}.pdf`;
        setUploading(true);

        const file = await fetch(fileUri).then((res) => res.blob());
        const { data, error } = await supabase.storage
          .from('wedding-documents')
          .upload(`appointments/${appointmentId}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          Alert.alert('Upload Failed', error.message);
          setUploading(false);
          return;
        }

        const filePath = data.path;
        const columnToUpdate = getColumnFromDocumentType(documentType);
        await supabase
          .from('wedding_appointments')
          .update({ [columnToUpdate]: filePath })
          .eq('appointment_id', appointmentId);

        Alert.alert('Upload Successful', `${documentType} uploaded successfully.`);
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      Alert.alert('Upload Failed', 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
    }
  };

  const getColumnFromDocumentType = (documentType: string) => {
    switch (documentType) {
      case 'Pre-Cana Seminar':
        return 'pre_cana_document';
      case 'Baptismal Certificate':
        return 'baptismal_certificate';
      case 'Birth Certificate':
        return 'birth_certificate';
      case 'Confirmation Certificate':
        return 'confirmation_certificate';
      case 'Marriage Bond':
        return 'marriage_bond';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </SafeAreaView>
    );
  }

  const canUploadPreCana = appointmentDetails?.status === 'Approved';
  const canUploadDocuments = canUploadPreCana && appointmentDetails?.pre_cana_verified;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Wedding Appointment Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Wedding Appointment Details</Text>
        {appointmentDetails ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bride's Name: </Text>
              {appointmentDetails.bride_name}
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Groom's Name: </Text>
              {appointmentDetails.groom_name}
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Wedding Date: </Text>
              {appointmentDetails.wedding_date}
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status: </Text>
              {appointmentDetails.status}
            </Text>

            <View style={styles.separator} />
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Prerequisite Requirement</Text>
              <View style={styles.requirementItem}>
                <Text>Pre-Cana Seminar</Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    !canUploadPreCana && styles.disabledButton,
                  ]}
                  disabled={!canUploadPreCana || uploading}
                  onPress={() => handleFileUpload('Pre-Cana Seminar')}
                >
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
              </View>

              {['Baptismal Certificate', 'Birth Certificate', 'Confirmation Certificate', 'Marriage Bond'].map((doc) => (
                <View key={doc} style={styles.requirementItem}>
                  <Text>{doc}</Text>
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      !canUploadDocuments && styles.disabledButton,
                    ]}
                    disabled={!canUploadDocuments || uploading}
                    onPress={() => handleFileUpload(doc)}
                  >
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.noDetailsText}>No details available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  appointmentListItem: { padding: 10, fontSize: 16, color: '#333' },
  detailsContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2 },
  detailItem: { fontSize: 16, color: '#333', marginBottom: 10 },
  detailLabel: { fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  requirementsContainer: { marginBottom: 20 },
  requirementsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  requirementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  uploadButton: { backgroundColor: '#C69C6D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  uploadButtonText: { color: '#FFF', fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#CCC' },
  noDetailsText: { fontSize: 16, color: '#333', textAlign: 'center', marginTop: 20 },
});

export default WeddingAppointmentDetails;
