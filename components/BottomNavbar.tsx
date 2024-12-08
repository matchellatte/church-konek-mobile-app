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
                name={isActive ? (tab.icon.replace('-outline', '') as any) : tab.icon} // Switch to filled icon
                size={26}
                color={isActive ? '#8C5A37' : '#4A5568'} // Active rich brown, inactive dark gray
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
    color: '#8C5A37', // Rich brown for active text
    fontWeight: 'bold', // Slightly bolder text
  },
  inactiveText: {
    color: '#4A5568', // Subtle gray for inactive text
  },
  
});

export default BottomNavbar;
