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
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/backend/lib/supabase';
import AppointmentTopNavbar from '../../components/appointment-details/details-navbar';
import ProgressBar from '../../components/appointment-details/progress-bar';

const UploadRequirements: React.FC = () => {
  const { appointmentId: rawAppointmentId } = useLocalSearchParams();
  const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId;

  const [requirements, setRequirements] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [appointmentType, setAppointmentType] = useState<string>('');

  useEffect(() => {
    if (appointmentId) {
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
        setLoading(false);
        return;
      }

      const type = data.services?.name?.toLowerCase().replace(/\s+/g, '_');
      setAppointmentType(type);

      const requirementsList = {
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
        funeral_mass: ['Baptismal Certificate', 'Death Certificate'],
      };

      setRequirements(requirementsList[type] || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (requirement: string) => {
    try {
      if (uploadedFiles[requirement]) {
        const userConfirmed = await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Replace File',
            `A file for "${requirement}" has already been uploaded. Do you want to replace it?`,
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Replace', onPress: () => resolve(true) },
            ],
            { cancelable: true }
          )
        );
  
        if (!userConfirmed) {
          return;
        }
      }
  
      const pickerResult = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*', // Allow all types for document picker
      });
  
      if (pickerResult.type === 'cancel') {
        return;
      }
  
      const file = pickerResult.assets[0];
  
      // Check for file type (only images and PDF allowed)
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '')) {
        Alert.alert('Invalid File Type', 'Only images (JPG, JPEG, PNG) and PDF files are allowed.');
        return;
      }
  
      const fileName = `${requirement.replace(/\s+/g, '_')}_${Date.now()}_${file.name}`;
  
      // Check if the file URI is valid
      if (!file.uri || file.uri.length === 0) {
        Alert.alert('Error', 'Invalid file. Please try again.');
        return;
      }
  
      // Read the file content as a binary buffer
      const fileBuffer = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64, // Base64 encoding for binary files
      });
      const buffer = new Uint8Array(atob(fileBuffer).split("").map(char => char.charCodeAt(0)));
  
      if (!buffer) {
        Alert.alert('Error', 'Failed to read the file content.');
        return;
      }
  
      // Determine the MIME type based on the file extension
      let contentType = '';
      if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        contentType = `image/${fileExtension}`;
      } else if (fileExtension === 'pdf') {
        contentType = 'application/pdf';
      }
  
      // Now upload the file content (in binary format) to Supabase
      const { data, error } = await supabase.storage
        .from('try2')  // Make sure this is your correct bucket name
        .upload(fileName, buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType,  // Set the correct MIME type
        });
  
      if (error) {
        throw error;
      }
  
      // Get the public URL of the uploaded file
      const { data: publicURLData } = supabase.storage
        .from('try2')  // Ensure this is your correct bucket name
        .getPublicUrl(fileName);
  
      const fileURL = publicURLData?.publicUrl;
  
      if (!fileURL) {
        throw new Error('Failed to generate the public URL for the file.');
      }
  
      // Update the state with the uploaded file's URL
      setUploadedFiles((prev) => ({
        ...prev,
        [requirement]: fileURL,
      }));
  
      Alert.alert('Success', `${requirement} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to upload ${requirement}.`);
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

      const { data: existingData, error: fetchError } = await supabase
        .from(tableName)
        .select('appointment_id')
        .eq('appointment_id', appointmentId);

      if (fetchError) {
        Alert.alert('Error', 'Failed to check existing submissions.');
        return;
      }

      if (existingData && existingData.length > 0) {
        Alert.alert('Error', 'Requirements for this appointment have already been submitted.');
        return;
      }

      const data = {
        appointment_id: appointmentId,
        ...Object.keys(uploadedFiles).reduce((acc, requirement) => {
          const columnKey = requirement
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          acc[columnKey] = uploadedFiles[requirement] || null;
          return acc;
        }, {}),
      };

      const { error } = await supabase.from(tableName).insert(data);

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'pending for approval' })
        .eq('appointment_id', appointmentId);

      if (updateError) {
        Alert.alert('Error', 'Failed to update appointment status.');
        return;
      }

      Alert.alert('Success', 'All documents submitted successfully!');
      navigateToAppointmentDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit documents.');
    }
  };

  const navigateToAppointmentDetails = () => {
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
            >
              <Text style={styles.uploadButtonText}>
                {uploadedFiles[requirement] ? 'Replace' : 'Upload'}
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