import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../backend/lib/supabase';
import { Upload } from 'tus-js-client';

interface UserInfo {
  fullName: string;
  email: string;
  profileImage: { uri: string };
  user_id: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    profileImage: { uri: '' },
    user_id: '',
  });
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserInfo = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
  
      if (error) throw error;
      if (!user) throw new Error('User not found');
  
      const { full_name, email } = user.user_metadata;
  
      // Fetch profile image URL from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_image')
        .eq('user_id', user.id)
        .single();
  
      if (userError) {
        console.error('Error fetching profile image URL:', userError.message);
        Alert.alert('Error', 'Failed to load profile image.');
      }
  
      setUserInfo({
        fullName: full_name || 'User Name',
        email: email || 'user@example.com',
        profileImage: { uri: userData?.profile_image || '' }, // Use the URL from database
        user_id: user.id,
      });
    } catch (error: any) {
      console.error('Error loading user info:', error.message);
      Alert.alert('Error', 'Failed to load user information.');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleProfileImageChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Gallery access is needed to change your profile picture.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const selectedImageUri = result.assets[0].uri;

        // Fetch the image and convert it to a Blob
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();
        const fileName = `${userInfo.email}-${Date.now()}.jpg`;

        // Upload the image using tus-js-client
        await uploadFileToSupabase(blob, fileName);
        
      } catch (error) {
        console.error('Error during profile image change:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const uploadFileToSupabase = async (file: Blob, fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = 'lrvhrdvpaywowecfncxj';
    const bucketName = 'profiles';
  
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
          contentType: 'image/jpeg',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: function (error) {
          console.log('Failed because:', error);
          reject(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`${percentage}% uploaded`);
        },
        onSuccess: async function () {
          const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
          
          // Update the profile image URL in the Supabase users table
          const { error: updateError } = await supabase
            .from('users')
            .update({ profile_image: publicUrl })
            .eq('user_id', userInfo.user_id);
  
          if (updateError) {
            console.error('Error updating profile image URL:', updateError);
            Alert.alert('Error', 'Failed to update profile image URL.');
          } else {
            setUserInfo((prev) => ({ ...prev, profileImage: { uri: publicUrl } }));
            Alert.alert('Success', 'Profile picture updated!');
            resolve();
          }
        },
      });
  
      upload.findPreviousUploads().then(function (previousUploads) {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
  
        upload.start();
      });
    });
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={handleProfileImageChange}>
          <Image
            source={userInfo.profileImage.uri ? userInfo.profileImage : require('../../assets/images/default-profile.jpg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{userInfo.fullName}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <Text style={styles.rowText}>Edit Profile</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Manage Payment')}>
            <Text style={styles.rowText}>Manage Payment</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E4E5',
    marginVertical: 5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  signOutText: {
    fontSize: 18,
    color: '#F44336',
    marginLeft: 10,
  },
});

export default Profile;
