import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TransparentTopNavbarProps {
  title: string;
  onBack?: () => void;
}

const TransparentTopNavbar: React.FC<TransparentTopNavbarProps> = ({ title, onBack }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.navTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 20,
      },
    }),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 15,
    right: 15,
  },
  navTitle: {
    ...Platform.select({
      ios: {
        fontSize: 22,
      },
      android: {
        fontSize: 18,
      },
    }),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
});

export default TransparentTopNavbar;
