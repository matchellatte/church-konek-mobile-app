import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TopNavbarProps {
  title: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ title }) => {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="chevron-back-outline" size={27} color="#4B3F3A" />
      </TouchableOpacity>
      <Text style={styles.navTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  navTitle: {
    ...Platform.select({
        ios: {
            fontSize: 22,
        },
        android: {
            fontSize: 15,
        },
    }),
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginLeft: 10,
  },
});

export default TopNavbar;
