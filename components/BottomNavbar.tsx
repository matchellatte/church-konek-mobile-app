import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';

const BottomNavbar = () => {
  const router = useRouter();
  const segments = useSegments();

  // Fix for Home: Default to "/" when there are no meaningful segments
  const activeTab = segments.length === 1 && segments[0] === '(tabs)' ? '/' : `/${segments[segments.length - 1]}`;

  const handleNavigate = (screen: string) => {
    if (activeTab !== screen) {
      router.push(screen as any); // Navigate only if not already on the screen
    }
  };

  const tabs = [
    { name: '/', label: 'Home', icon: 'home-outline' },
    { name: '/appointment', label: 'Appointment', icon: 'add-circle-outline' },
    { name: '/calendar', label: 'Calendar', icon: 'calendar-outline' },
    { name: '/profile', label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.navItem}
              onPress={() => handleNavigate(tab.name)}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={26}
                color={isActive ? '#D2691E' : '#4A5568'} // Active icon is orange-brown, inactive is dark gray
              />
              <Text style={[styles.navText, isActive ? styles.activeText : styles.inactiveText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  activeText: {
    color: '#D2691E', // Solid orange-brown for active text
  },
  inactiveText: {
    color: '#4A5568', // Darker color for inactive text
  },
});

export default BottomNavbar;
