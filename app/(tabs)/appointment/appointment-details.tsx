import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '@/backend/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Upload } from 'tus-js-client';

const AppointmentDetails = () => {
  const router = useRouter();
  const { appointmentId: appointmentIdParam, appointmentType: appointmentTypeParam } = useLocalSearchParams();
  const appointmentId = Array.isArray(appointmentIdParam) ? appointmentIdParam[0] : appointmentIdParam;
  const appointmentType = Array.isArray(appointmentTypeParam) ? appointmentTypeParam[0] : appointmentTypeParam;
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const documentRequirements: Record<string, string[]> = {
    Wedding: [
      'Bride Baptismal Certificate',
      'Groom Baptismal Certificate',
      'Bride Birth Certificate',
      'Groom Birth Certificate',
      'Bride Confirmation Certificate',
      'Groom Confirmation Certificate',
      'Bride Marriage Bond',
      'Groom Marriage Bond',
      'Pre-Cana Seminar',
    ],
    Baptism: ['Child Birth Certificate', 'Parent Birth Certificates'],
    'Funeral Mass': ['Baptismal Certificate', 'Death Certificate'],
    Kumpil: [
      'Student Baptismal Certificate',
      'Student Birth Certificate',
      'Ninong Confirmation Certificate',
      'Ninang Confirmation Certificate',
    ],
  };

  const documentColumnMap: Record<string, string> = {
    'Bride Baptismal Certificate': 'bride_baptismal_certificate',
    'Groom Baptismal Certificate': 'groom_baptismal_certificate',
    'Bride Birth Certificate': 'bride_birth_certificate',
    'Groom Birth Certificate': 'groom_birth_certificate',
    'Bride Confirmation Certificate': 'bride_confirmation_certificate',
    'Groom Confirmation Certificate': 'groom_confirmation_certificate',
    'Bride Marriage Bond': 'bride_marriage_bond',
    'Groom Marriage Bond': 'groom_marriage_bond',
    'Pre-Cana Seminar': 'pre_cana_seminar',
    'Child Birth Certificate': 'child_birth_certificate',
    'Parent Birth Certificates': 'parent_birth_certificates',
    'Baptismal Certificate': 'baptismal_certificate',
    'Death Certificate': 'death_certificate',
    'Student Baptismal Certificate': 'student_baptismal_certificate',
    'Student Birth Certificate': 'student_birth_certificate',
    'Ninong Confirmation Certificate': 'ninong_confirmation_certificate',
    'Ninang Confirmation Certificate': 'ninang_confirmation_certificate',
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      Alert.alert('Error', 'Failed to load appointment details');
    } else {
      setAppointmentDetails(data);
    }
  };

  const cancelAppointment = async () => {
    try {
      setCanceling(true);

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('appointment_id', appointmentId);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Appointment has been canceled.');
      setAppointmentDetails((prev: any) => ({ ...prev, status: 'cancelled' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel the appointment.');
    } finally {
      setCanceling(false);
    }
  };

  const handleUpload = async (pickerResult: any, requirement: string) => {
    try {
      setUploading(true);
      setUploadingFor(requirement);

      const uri = pickerResult.assets[0]?.uri;
      if (!uri) throw new Error('File URI not found.');

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${appointmentType}/${requirement.replace(/ /g, '_')}_${Date.now()}.jpg`;

      await uploadFileToSupabase(blob, fileName, requirement, appointmentType, appointmentId);
    } catch (error) {
      console.error('Error during upload:', error);
      Alert.alert('Error', 'Failed to upload the document.');
    } finally {
      setUploading(false);
      setUploadingFor(null);
    }
  };
  

  const uploadFileToSupabase = async (
    file: Blob | null,
    fileName: string | null,
    requirement: string | null,
    appointmentType: string | null,
    appointmentId: string | null
  ) => {
    // Validate required parameters
    if (!file) {
      console.error('File is undefined or null');
      Alert.alert('Error', 'File is missing. Please select a valid file.');
      return;
    }
  
    if (!fileName || !requirement || !appointmentType || !appointmentId) {
      console.error('One or more required parameters are undefined:', {
        fileName,
        requirement,
        appointmentType,
        appointmentId,
      });
      Alert.alert('Error', 'Required parameters are missing. Please try again.');
      return;
    }
  
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
  
    if (!session) {
      console.error('Session not found. Please log in.');
      Alert.alert('Error', 'User session not found. Please log in again.');
      return;
    }
  
    const projectId = 'lrvhrdvpaywowecfncxj';
    const bucketName = 'documents';
  
    const tableColumnMap: Record<string, { table: string; columns: Record<string, string> }> = {
      Kumpil: {
        table: 'kumpilforms',
        columns: {
          'Student Baptismal Certificate': 'student_baptismal_certificate',
          'Student Birth Certificate': 'student_birth_certificate',
          'Ninong Confirmation Certificate': 'ninong_confirmation_certificate',
          'Ninang Confirmation Certificate': 'ninang_confirmation_certificate',
        },
      },
    };
  
    const appointmentConfig = tableColumnMap[appointmentType];
    if (!appointmentConfig) {
      console.error(`Unsupported appointment type: ${appointmentType}`);
      Alert.alert('Error', `Unsupported appointment type: ${appointmentType}`);
      return;
    }
  
    const tableName = appointmentConfig.table;
    const documentColumnMap = appointmentConfig.columns;
    const documentColumn = documentColumnMap[requirement];
  
    if (!documentColumn) {
      console.error(`Invalid requirement: ${requirement} for appointment type: ${appointmentType}`);
      Alert.alert('Error', `Invalid requirement: ${requirement}`);
      return;
    }
  
    return new Promise<void>((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        metadata: {
          bucketName,
          objectName: fileName,
          contentType: file.type,
        },
        chunkSize: 6 * 1024 * 1024,
        onError: (error) => {
          console.error('Upload failed:', error);
          Alert.alert('Error', 'Failed to upload the document.');
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`${percentage}% uploaded`);
        },
        onSuccess: async () => {
          const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
          console.log('File uploaded. Public URL:', publicUrl);
  
          setAttachments((prev) => ({
            ...prev,
            [requirement]: publicUrl,
          }));
  
          try {
            const { data, error: updateError } = await supabase
              .from(tableName)
              .update({ [documentColumn]: publicUrl, uploaded_at: new Date() })
              .eq('kumpil_form_id', appointmentId);
  
            if (updateError) {
              console.error('Error updating document in table:', updateError.message);
              Alert.alert('Error', `Failed to save the ${requirement} to the database.`);
            } else {
              console.log('Update successful:', data);
              Alert.alert('Success', `${requirement} uploaded and saved successfully!`);
            }
            resolve();
          } catch (error) {
            console.error('Error during upload:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            reject(error);
          }
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
  
  
  
  
  
  
  
  
  
  

  const pickImage = async (requirement: string) => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaTypeOptions
      allowsMultipleSelection: false,
    });
  
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const file = pickerResult.assets[0];
      const fileName = file.fileName || file.uri.split('/').pop();
      const fileUri = file.uri;
  
      // Fetch the file and convert to Blob
      const response = await fetch(fileUri);
      const blob = await response.blob();
  
      if (!fileName || !blob) {
        console.error('Failed to get file or blob');
        return;
      }
  
      await uploadFileToSupabase(blob, fileName, requirement, 'Kumpil', appointmentId);
    } else {
      console.log('Image picking canceled or no image selected');
    }
  };
  

  const handleSubmitRequirements = async () => {
    try {
      setSubmitting(true);

      const missingDocuments = documentRequirements[appointmentType]?.filter(
        (requirement) => !attachments[requirement]
      );

      if (missingDocuments.length > 0) {
        Alert.alert('Error', `Please upload all required documents.`);
        return;
      }

      Alert.alert('Success', 'All requirements submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit requirements.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointmentDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading appointment details...</Text>
      </SafeAreaView>
    );
  }

  const { appointment_date: appointmentDate, status } = appointmentDetails;

  const formattedDate = appointmentDate?.split('T')[0] || 'No date provided';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Appointment Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Appointment Type:</Text>
          <Text style={styles.value}>{appointmentType}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Appointment Date:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{status}</Text>
        </View>

        {status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.cancelButton, { opacity: canceling ? 0.6 : 1 }]}
            onPress={cancelAppointment}
            disabled={canceling}
          >
            <Text style={styles.cancelButtonText}>
              {canceling ? 'Canceling...' : 'Cancel Appointment'}
            </Text>
          </TouchableOpacity>
        )}

        {status === 'cancelled' && (
          <Text style={styles.infoText}>This appointment has been cancelled.</Text>
        )}

        {status === 'pending for requirements' && (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Upload Requirements</Text>
            <Text style={styles.infoText}>Please upload all the required documents below:</Text>
            {documentRequirements[appointmentType]?.map((requirement, index) => (
              <View key={index} style={styles.bentoBox}>
                <View style={styles.requirementHeader}>
                  <Text style={styles.requirementText}>
                    {requirement} <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  {attachments[requirement] && (
                    <Ionicons name="checkmark-circle-outline" size={20} color="green" />
                  )}
                </View>
                <Text style={styles.attachmentName}>
                  {attachments[requirement]?.split('/').pop() || 'No file attached'}
                </Text>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => pickImage(requirement)}>
                    <Icon name="photo-library" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.submitButton, { opacity: submitting ? 0.6 : 1 }]}
              disabled={submitting}
              onPress={handleSubmitRequirements}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Requirements'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'pending for approval' && (
          <Text style={styles.infoText}>
            Your appointment is pending for approval. Please wait for further updates.
          </Text>
        )}

        {status === 'approved' && (
          <Text style={styles.infoText}>Your appointment has been approved. See you on the date!</Text>
        )}

        {status === 'completed' && (
          <Text style={styles.infoText}>This appointment is completed. Thank you!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Soft background for the overall layout
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF', // Navbar background
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Subtle divider
  },
  backButton: {
    padding: 10,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Dark text for title
    marginLeft: 10,
  },
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,

  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#4B5563',
  },
  uploadSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  bentoBox: {
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 15,
  },
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  requiredAsterisk: {
    color: '#EF4444', // Red for required fields
  },
  attachmentName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626', // Red for cancel button border
    backgroundColor: '#FEF2F2', // Soft red background
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#6A5D43', // Neutral warm brown
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default AppointmentDetails;
