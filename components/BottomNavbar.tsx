import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';

const BottomNavbar = () => {
  const router = useRouter();
  const segments = useSegments();
  const activeTab = segments[0]; // Get the active tab based on the URL segments

  const isAppointmentRelated = [
    'appointment',
    'baptism',
    'wedding',
    'prayerIntention',
    'funeralMass',
    'houseBlessing',
    'requestCertificate',
    'firstCommunion',
    'kumpil',
    'specialMass',
  ].includes(activeTab);

  // Define a specific type for screen paths
  const handleNavigate = (screen: '/' | '/appointment' | '/calendar' | '/profile') => {
    router.push(screen); // Use `push` to navigate between screens in Expo Router
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        {[
          { name: '/', label: 'Home', icon: 'home-outline' as keyof typeof Ionicons.glyphMap },
          { name: '/appointment', label: 'Appointment', icon: 'add-circle-outline' as keyof typeof Ionicons.glyphMap },
          { name: '/calendar', label: 'Calendar', icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap },
          { name: '/profile', label: 'Profile', icon: 'person-outline' as keyof typeof Ionicons.glyphMap },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => handleNavigate(tab.name as '/' | '/appointment' | '/calendar' | '/profile')}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={
                (tab.name === '/appointment' && isAppointmentRelated) || activeTab === tab.name
                  ? '#6A5D43'
                  : '#666'
              }
            />
            <Text
              style={[
                styles.navText,
                ((tab.name === '/appointment' && isAppointmentRelated) || activeTab === tab.name) &&
                  styles.activeTab,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8f8f8',
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    elevation: 10,
    zIndex: 100, // Ensure it stays on top
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for bottom insets
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  activeTab: {
    fontWeight: 'bold',
    color: '#6A5D43',
  },
});

export default BottomNavbar;
