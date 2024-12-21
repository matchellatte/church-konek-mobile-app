import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/backend/lib/supabase'; // Ensure the path is correct

const UploadDonation: React.FC = ({ navigation }) => {
  const [uploadedFile, setUploadedFile] = useState<{ [key: string]: string }>({});
  const [modalVisible, setModalVisible] = useState(false);

  const handleUpload = async (requirement: string) => {
    try {
      if (uploadedFile[requirement]) {
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
        type: '*/*',
      });

      if (pickerResult.type === 'cancel') {
        return;
      }

      const file = pickerResult.assets[0];

      if (!file.uri || file.uri.length === 0) {
        Alert.alert('Error', 'Invalid file URI. Please try again.');
        return;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '')) {
        Alert.alert('Invalid File Type', 'Only images (JPG, JPEG, PNG) and PDF files are allowed.');
        return;
      }

      const fileName = `${requirement.replace(/\s+/g, '_')}_${Date.now()}_${file.name}`;

      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!fileData || fileData.length === 0) {
        Alert.alert('Error', 'Failed to read the file content.');
        return;
      }

      const buffer = new Uint8Array(atob(fileData).split("").map((char) => char.charCodeAt(0)));

      const { error } = await supabase.storage
        .from('try2')
        .upload(fileName, buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension}`,
        });

      if (error) {
        throw error;
      }

      const { data: publicURLData } = supabase.storage
        .from('try2')
        .getPublicUrl(fileName);

      const fileURL = publicURLData?.publicUrl;

      if (!fileURL) {
        throw new Error('Failed to generate the public URL for the file.');
      }

      setUploadedFile((prev) => ({
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
    if (!uploadedFile['receipt']) {
      Alert.alert('Error', 'Please upload a receipt before submitting.');
      return;
    }

    try {
      const { error } = await supabase.from('new_gcash_receipt').insert({
        receipt_certificate: uploadedFile['receipt'],
        uploaded_at: new Date().toISOString(),
      });

      if (error) throw error;

      setModalVisible(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit the receipt.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Upload Donation Receipt</Text>

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload('receipt')}>
        <Text style={styles.uploadButtonText}>
          {uploadedFile['receipt'] ? 'Replace Receipt' : 'Upload Receipt'}
        </Text>
      </TouchableOpacity>

      {/* Success Message */}
      {uploadedFile['receipt'] && <Text style={styles.successText}>Receipt uploaded successfully!</Text>}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, !uploadedFile['receipt'] && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!uploadedFile['receipt']}
      >
        <Text style={styles.submitButtonText}>Submit Receipt</Text>
      </TouchableOpacity>

      {/* Thank You Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Thank you for your generosity!</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20, color: '#4B5563' },
  uploadButton: {
    backgroundColor: '#D29A6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginVertical: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  uploadButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  successText: { color: '#4B5563', fontSize: 16, marginVertical: 10 },
  submitButton: {
    backgroundColor: '#D29A6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: { backgroundColor: '#E5E7EB' },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  modalText: { fontSize: 20, fontWeight: '700', color: '#4B5563', marginBottom: 15 },
  closeText: { color: '#D29A6B', fontSize: 16, fontWeight: '600' },
});

export default UploadDonation;
