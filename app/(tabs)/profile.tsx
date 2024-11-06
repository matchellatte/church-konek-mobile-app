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

interface UserInfo {
  fullName: string;
  email: string;
  profileImage: { uri: string };
  user_id: string; // Add user_id to the UserInfo type
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    profileImage: { uri: '' },
    user_id: '', // Initialize user_id as an empty string
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load user info from Supabase
  const loadUserInfo = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error('User not found');

      const { full_name, email, profile_image } = user.user_metadata;
      const storedImageUri = profile_image || await AsyncStorage.getItem('profileImage');

      setUserInfo({
        fullName: full_name || 'User Name',
        email: email || 'user@example.com',
        profileImage: storedImageUri ? { uri: storedImageUri } : { uri: '' },
        user_id: user.id, // Set the user_id here
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
  
        // Fetch the image and convert it to a blob
        const response = await fetch(selectedImageUri);
        if (!response.ok) {
          throw new Error('Failed to fetch the image from the local URI');
        }
  
        const blob = await response.blob();
        if (!blob) {
          throw new Error('Failed to create blob from the image');
        }
  
        const fileName = `profile-images/${userInfo.email}-${Date.now()}.jpg`;
  
        // Upload the image to Supabase storage
        const { data, error } = await supabase.storage
          .from('profile-images') // Ensure this matches your bucket name
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: true,
          });
  
        if (error) {
          console.error('Error uploading profile image:', error.message);
          Alert.alert('Upload Failed', 'An error occurred while uploading the profile image.');
          return;
        }
  
        // Generate the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('profile-images') // Ensure this matches your bucket name
          .getPublicUrl(fileName);
  
        if (!publicUrlData?.publicUrl) {
          console.error('Error generating public URL');
          Alert.alert('Error', 'Could not generate the URL for the uploaded image.');
          return;
        }
  
        // Update the `profile_image` field in the `users` table
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_image: publicUrlData.publicUrl })
          .eq('user_id', userInfo.user_id);
  
        if (updateError) {
          console.error('Error updating user profile image:', updateError.message);
          Alert.alert('Error', 'Could not update the profile image in the database.');
          return;
        }
  
        // Update the local state to reflect the new profile image
        setUserInfo((prev) => ({ ...prev, profileImage: { uri: publicUrlData.publicUrl } }));
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        console.error('Error during profile image change:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Notifications')}>
            <Text style={styles.rowText}>Notifications</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('FAQs')}>
            <Text style={styles.rowText}>FAQs</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('About Us')}>
            <Text style={styles.rowText}>About Us</Text>
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
