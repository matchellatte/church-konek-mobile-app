import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/backend/lib/supabase';
import AppointmentTopNavbar from '../../components/appointment-details/details-navbar';
import ProgressBar from '../../components/appointment-details/progress-bar';
import { uploadFiles } from '@/backend/lib/tus'; // Import the TUS uploader

const UploadRequirements: React.FC = () => {
  const { appointmentId: rawAppointmentId } = useLocalSearchParams();
  const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId; // Ensure it's a string

  const [requirements, setRequirements] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [appointmentType, setAppointmentType] = useState<string>('');

  useEffect(() => {
    if (appointmentId) {
      console.log('appointmentId:', appointmentId); // Debugging
      fetchRequirements();
    } else {
      Alert.alert('Error', 'Invalid appointment ID.');
    }
  }, [appointmentId]);

  const fetchRequirements = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('services(name)')
        .eq('appointment_id', appointmentId)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'Failed to fetch appointment type.');
        console.error('Error fetching appointment type:', error);
        return;
      }

      const type = data.services?.name?.toLowerCase();
      console.log('Fetched type:', type);
      setAppointmentType(type);

      const requirementsList: Record<string, string[]> = {
        kumpil: [
          'Student Baptismal Certificate',
          'Student Birth Certificate',
          'Ninong Confirmation Certificate',
          'Ninang Confirmation Certificate',
        ],
        wedding: [
          'Bride Baptismal Certificate',
          'Groom Baptismal Certificate',
          'Bride Birth Certificate',
          'Groom Birth Certificate',
          'Bride Confirmation Certificate',
          'Groom Confirmation Certificate',
        ],
        baptism: ['Child Birth Certificate', 'Parent Birth Certificates'],
      };

      setRequirements(requirementsList[type] || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (requirement: string) => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
  
      if (pickerResult.type === 'cancel') {
        return;
      }
  
      console.log('Starting upload for requirement:', requirement);
      console.log('Selected file:', pickerResult);
  
      const file = pickerResult.assets[0];
      const fileName = `${requirement.replace(/\s+/g, '_')}_${Date.now()}_${file.name}`;
  
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('requirements')
        .upload(fileName, file.uri, {
          cacheControl: '3600',
          upsert: true,
        });
  
      if (error) {
        throw error;
      }
  
      // Generate the public URL for the uploaded file
      const { data: publicURLData } = supabase.storage
        .from('requirements')
        .getPublicUrl(fileName);
  
      const fileURL = publicURLData?.publicUrl;
  
      if (!fileURL) {
        throw new Error('Failed to generate the public URL for the file.');
      }
  
      // Save the file URL to the uploadedFiles state
      setUploadedFiles((prev) => ({
        ...prev,
        [requirement]: fileURL,
      }));
  
      Alert.alert('Success', `${requirement} uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', `Failed to upload ${requirement}`);
    }
  };
  
  


  const handleSubmit = async () => {
    try {
      if (!appointmentType) {
        Alert.alert('Error', 'Appointment type is missing.');
        return;
      }
  
      const tableMap: Record<string, string> = {
        kumpil: 'kumpil_documents',
        wedding: 'wedding_documents',
        baptism: 'baptism_documents',
        funeral_mass: 'funeral_documents',
      };
  
      const tableName = tableMap[appointmentType];
      if (!tableName) {
        Alert.alert('Error', 'Invalid appointment type for submission.');
        return;
      }
  
      // Check for duplicate appointment_id
      const { data: existingData, error: fetchError } = await supabase
        .from(tableName)
        .select('appointment_id')
        .eq('appointment_id', appointmentId);
  
      if (fetchError) {
        console.error('Error checking for duplicates:', fetchError);
        Alert.alert('Error', 'Failed to check existing submissions.');
        return;
      }
  
      if (existingData && existingData.length > 0) {
        Alert.alert('Error', 'Requirements for this appointment have already been submitted.');
        return;
      }
  
      // Prepare data with public URLs
      const data = {
        appointment_id: appointmentId,
        ...Object.keys(uploadedFiles).reduce((acc, requirement) => {
          const columnKey = requirement
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, ''); // Match column names
          acc[columnKey] = uploadedFiles[requirement] || null;
          return acc;
        }, {}),
      };
  
      const { error } = await supabase.from(tableName).insert(data);
  
      if (error) {
        throw error;
      }
  
      // Update the appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'pending for approval' })
        .eq('appointment_id', appointmentId);
  
      if (updateError) {
        console.error('Error updating appointment status:', updateError);
        Alert.alert('Error', 'Failed to update appointment status.');
        return;
      }
  
      Alert.alert('Success', 'All documents submitted successfully!');
      // Navigate back to the appointment details page
      navigateToAppointmentDetails();
    } catch (error) {
      console.error('Error during submission:', error);
      Alert.alert('Error', 'Failed to submit documents.');
    }
  };
  
  // Helper function to navigate to appointment details
  const navigateToAppointmentDetails = () => {
    // Use router.push to navigate to appointment-details page
    router.push(`/appointment/appointment-details?appointmentId=${appointmentId}`);
  };
  
  
  
  

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading requirements...</Text>
      </SafeAreaView>
    );
  }

  const allUploaded = requirements.every((req) => uploadedFiles[req]);

  return (
    <SafeAreaView style={styles.container}>
      <AppointmentTopNavbar title="Upload Requirements" />
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressBar progress={0.5} />
        <Text style={styles.progressText}>2/2 Requirements Upload</Text>

        <Text style={styles.sectionHeader}>Upload Requirements</Text>
        {requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementRow}>
            <Text style={styles.requirementText}>{requirement}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUpload(requirement)}
              disabled={!!uploadedFiles[requirement]}
            >
              <Text style={styles.uploadButtonText}>
                {uploadedFiles[requirement] ? 'Uploaded' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {allUploaded && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
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
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  requirementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default UploadRequirements;
