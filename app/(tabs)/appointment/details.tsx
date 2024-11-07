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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../backend/lib/supabase';
import { Upload } from 'tus-js-client';
import * as ImagePicker from 'expo-image-picker';


const AppointmentDetails = () => {
  const router = useRouter();
  const { appointmentId, appointmentType } = useLocalSearchParams();
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (appointmentId && appointmentType) {
      fetchAppointmentDetails();
    } else {
      console.warn("No appointmentId or appointmentType provided");
    }
  }, [appointmentId, appointmentType]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    const tableName = 'appointments';
    const { data, error } = await supabase
      .from(tableName)
      .select('appointment_date, status')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching details:", error);
      Alert.alert('Error fetching appointment details', error.message);
    } else if (!data) {
      Alert.alert('No details found', `No ${appointmentType} appointment details found for this ID.`);
    } else {
      setAppointmentDetails(data);
    }
    setLoading(false);
  };

  const projectId = 'lrvhrdvpaywowecfncxj'; // Your actual Supabase project ID
  
  const uploadFileToSupabase = async (file: Blob, fileName: string, appointmentType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
  
    // Bucket mappings for exact bucket names
    const bucketMapping: { [key: string]: string } = {
      wedding: 'wedding-documents',
      baptism: 'baptism-documents',
      funeral: 'funeral-documents',
      // Add other mappings with correct bucket names
    };
  
    const bucketName = bucketMapping[appointmentType.toLowerCase()];
    if (!bucketName) {
      Alert.alert('Error', `No bucket found for appointment type: ${appointmentType}`);
      return;
    }
  
    return new Promise<void>((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName,
          objectName: fileName,
          contentType: 'application/pdf',  // Adjust based on file type if needed
        },
        chunkSize: 6 * 1024 * 1024,
        onError: function (error) {
          console.error('Upload failed:', error);
          Alert.alert('Upload Failed', 'An error occurred during file upload.');
          setUploading(false);
          reject(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`${percentage}% uploaded`);
        },
        onSuccess: async function () {
          const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

          const columnToUpdate = getColumnFromDocumentType(fileName);
          const { error: updateError } = await supabase
            .from(`${appointmentType}_appointments`)
            .update({ [columnToUpdate]: publicUrl })
            .eq('appointment_id', appointmentId);

          if (updateError) {
            console.error('Error updating file URL:', updateError);
            Alert.alert('Error', 'Failed to update file URL.');
          } else {
            Alert.alert('Upload Successful', `${fileName} uploaded successfully.`);
          }
          setUploading(false);
          resolve();
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
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

  const handleFileUpload = async (documentType: string) => {
    try {
      let fileUri;
      let fileType;
  
      if (documentType === 'PDF') {
        // Use a simulated approach for PDFs, as we can't select PDF without DocumentPicker
        Alert.alert('Select PDF', 'For PDF uploads, please use a desktop or supported device.');
        return;
      } else {
        // Request permissions for image access
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission required', 'Gallery access is needed to select a file.');
          return;
        }
  
        // Select an image
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
  
        if (result.canceled) {
          Alert.alert('Upload Canceled', 'No file was selected.');
          return;
        }
  
        fileUri = result.assets[0].uri;
        fileType = 'image/jpeg'; // Adjust based on selected file format (jpeg, png)
      }
  
      const fileName = `${documentType}-${Date.now()}.${fileType.split('/').pop()}`;
  
      // Fetch the file and convert it to a Blob
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();
  
      setUploading(true);
      await uploadFileToSupabase(fileBlob, fileName, appointmentType as string);
    } catch (error) {
      console.error('Error during file selection or upload:', error);
      Alert.alert('Upload Failed', 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{`${appointmentType} Appointment Details`}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {appointmentDetails ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Appointment Date: </Text>
              {appointmentDetails.appointment_date}
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status: </Text>
              {appointmentDetails.status}
            </Text>

            {appointmentDetails.status === "pending for requirements" && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Upload Requirements</Text>
                {['Pre-Cana Seminar', 'Baptismal Certificate', 'Birth Certificate', 'Confirmation Certificate', 'Marriage Bond'].map((doc) => (
                  <View key={doc} style={styles.requirementItem}>
                    <Text>{doc}</Text>
                    <TouchableOpacity
                      style={[styles.uploadButton, uploading && styles.disabledButton]}
                      disabled={uploading}
                      onPress={() => handleFileUpload(doc)}
                    >
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContainer: { padding: 20 },
  detailsContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  detailItem: { fontSize: 16, color: '#333', marginBottom: 10 },
  detailLabel: { fontWeight: 'bold' },
  requirementsContainer: { marginTop: 20 },
  requirementsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  requirementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  uploadButton: { backgroundColor: '#C69C6D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  uploadButtonText: { color: '#FFF', fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#CCC' },
  noDetailsText: { fontSize: 16, color: '#333', textAlign: 'center', marginTop: 20 },
});

export default AppointmentDetails;
