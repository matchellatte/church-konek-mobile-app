// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { supabase } from '../../../backend/lib/supabase';
// import * as DocumentPicker from 'expo-document-picker';
// import { uploadFileWithTUS } from '../../../backend/lib/tus';

// const AppointmentDetails = () => {
//   const router = useRouter();
//   const { appointmentId, appointmentType } = useLocalSearchParams();
//   const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     if (appointmentId && appointmentType) {
//       fetchAppointmentDetails();
//     }
//   }, [appointmentId, appointmentType]);

//   const fetchAppointmentDetails = async () => {
//     try {
//       console.log('Fetching appointment details...');
//       setLoading(true);

//       const { data, error } = await supabase
//         .from('appointments')
//         .select('appointment_date, status')
//         .eq('appointment_id', appointmentId)
//         .maybeSingle();

//       if (error) {
//         console.error('Error fetching details:', error.message);
//         Alert.alert('Error', 'Failed to fetch appointment details.');
//       } else {
//         console.log('Appointment Details:', data);
//         setAppointmentDetails(data);
//       }
//     } catch (error) {
//       console.error('Error during fetch:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileUpload = async (documentType: string) => {
//     try {
//       console.log(`Starting upload for document type: ${documentType}`);
//       const result = await DocumentPicker.getDocumentAsync({
//         type: 'application/pdf',
//         copyToCacheDirectory: false,
//       });
  
//       if (result.type === 'cancel') {
//         console.log('Upload canceled by user.');
//         Alert.alert('Upload Canceled', 'No file was selected.');
//         return;
//       }
  
//       console.log('Document selected:', result);
//       const fileUri = result.uri;
//       const fileName = `${documentType}-${Date.now()}.pdf`;
  
//       // Convert the file to a Blob
//       const response = await fetch(fileUri);
//       const fileBlob = await response.blob();
  
//       // Add the console.logs for debugging the Blob here
//       console.log('File Blob Details:');
//       console.log('Blob Size:', fileBlob.size);
//       console.log('Blob Type:', fileBlob.type);
//       console.log('Blob Object:', fileBlob);
  
//       setUploading(true);
  
//       const { data } = await supabase.auth.getSession();
//       if (!data.session || !data.session.access_token) {
//         throw new Error('User is not authenticated.');
//       }
  
//       const accessToken = data.session.access_token;
//       console.log('Access Token:', accessToken);
  
//       const publicUrl = await uploadFileWithTUS(fileBlob, 'files', fileName, accessToken);
  
//       console.log('File uploaded successfully. Public URL:', publicUrl);
  
//       // Update database with the file's public URL
//       const column = getColumnFromDocumentType(documentType);
//       if (column) {
//         const { error } = await supabase
//           .from('appointments')
//           .update({ [column]: publicUrl })
//           .eq('appointment_id', appointmentId);

//         if (error) {
//           console.error('Error updating database:', error.message);
//           Alert.alert('Error', 'Failed to update appointment with uploaded document.');
//         } else {
//           Alert.alert('Success', 'Document uploaded and appointment updated successfully.');
//         }
//       } else {
//         console.error('Invalid document type:', documentType);
//         Alert.alert('Error', 'Invalid document type selected.');
//       }
//     } catch (error) {
//       console.error('Error during file upload:', error);
//       Alert.alert('Error', 'Failed to upload document.');
//     } finally {
//       setUploading(false);
//     }
//   };
  

//   const getColumnFromDocumentType = (documentType: string) => {
//     switch (documentType) {
//       case 'Pre-Cana Seminar':
//         return 'pre_cana_document';
//       case 'Baptismal Certificate':
//         return 'baptismal_certificate';
//       case 'Birth Certificate':
//         return 'birth_certificate';
//       case 'Confirmation Certificate':
//         return 'confirmation_certificate';
//       case 'Marriage Bond':
//         return 'marriage_bond';
//       default:
//         return '';
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#333" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.navBar}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="chevron-back-outline" size={30} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>{`${appointmentType} Appointment Details`}</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {appointmentDetails ? (
//           <View style={styles.detailsContainer}>
//             <Text style={styles.detailItem}>
//               <Text style={styles.detailLabel}>Appointment Date: </Text>
//               {appointmentDetails.appointment_date}
//             </Text>
//             <Text style={styles.detailItem}>
//               <Text style={styles.detailLabel}>Status: </Text>
//               {appointmentDetails.status}
//             </Text>

//             {appointmentDetails.status === 'pending for requirements' && (
//               <View style={styles.requirementsContainer}>
//                 <Text style={styles.requirementsTitle}>Upload Requirements</Text>
//                 {['Pre-Cana Seminar', 'Baptismal Certificate', 'Birth Certificate', 'Confirmation Certificate', 'Marriage Bond'].map((doc) => (
//                   <View key={doc} style={styles.requirementItem}>
//                     <Text>{doc}</Text>
//                     <TouchableOpacity
//                       style={[styles.uploadButton, uploading && styles.disabledButton]}
//                       disabled={uploading}
//                       onPress={() => handleFileUpload(doc)}
//                     >
//                       <Text style={styles.uploadButtonText}>Upload</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <Text style={styles.noDetailsText}>No details available.</Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FAFAFA' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
//   navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//   scrollContainer: { padding: 20 },
//   detailsContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
//   detailItem: { fontSize: 16, color: '#333', marginBottom: 10 },
//   detailLabel: { fontWeight: 'bold' },
//   requirementsContainer: { marginTop: 20 },
//   requirementsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
//   requirementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   uploadButton: { backgroundColor: '#C69C6D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
//   uploadButtonText: { color: '#FFF', fontWeight: 'bold' },
//   disabledButton: { backgroundColor: '#CCC' },
//   noDetailsText: { fontSize: 16, color: '#333', textAlign: 'center', marginTop: 20 },
// });

// export default AppointmentDetails;
