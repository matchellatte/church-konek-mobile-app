import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../backend/lib/supabase';
import ProfileHeader from '../../components/profile-components/profile-header';
import ProfileSection from '../../components/profile-components/profile-section';
import ProfileRow from '../../components/profile-components/profile-row';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the icon

const Profile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);

  const loadUserInfo = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error('User not found');

      const { full_name, email } = user.user_metadata;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_image')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        Alert.alert('Error', 'Failed to load profile image.');
      }

      setUserInfo({
        fullName: full_name || 'User Name',
        email: email || 'user@example.com',
        profileImage: userData?.profile_image || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load user information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A57A5A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader profileImage={userInfo.profileImage} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{userInfo.fullName}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
        <ProfileSection title="Account">
          <ProfileRow label="Edit Profile" onPress={() => router.push('/profile/edit-profile')} />
          <ProfileRow label="Prayer Intention" onPress={() => router.push('/profile/prayer-intention')} />
          <ProfileRow label="Generate Certificate" onPress={() => router.push('/profile/manage-certificate')} />
          <ProfileRow label="Change Password" onPress={() => router.push('/profile/change-password')} />
        </ProfileSection>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={25} color="#A61B1B" style={styles.signOutIcon} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    ...Platform.select({
      ios: {
        paddingTop: 210,
      },
      android: {
        paddingTop: 250,
      },
    }),
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  signOutIcon: {
    marginRight: 10, 
  },
  signOutText: {
    ...Platform.select({
      ios: {
        fontSize: 18,
      },
      android: {
        fontSize: 15,
      },
    }),
    color: '#A61B1B',
    fontWeight: 'bold',
  },
});

export default Profile;
