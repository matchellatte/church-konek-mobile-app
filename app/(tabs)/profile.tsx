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
  ImageSourcePropType,
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
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    profileImage: { uri: '' },
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load user info from Supabase
  const loadUserInfo = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) throw new Error('User not found');
      const { full_name, email } = user.user_metadata;
      const storedImageUri = await AsyncStorage.getItem('profileImage');

      setUserInfo({
        fullName: full_name || 'User Name',
        email: email || 'user@example.com',
        profileImage: storedImageUri ? { uri: storedImageUri } : { uri: '' },
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
        await AsyncStorage.setItem('profileImage', selectedImageUri);
        setUserInfo((prev) => ({ ...prev, profileImage: { uri: selectedImageUri } }));
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        console.error('Error saving profile image:', error);
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
