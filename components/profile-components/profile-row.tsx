import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileRowProps {
  label: string;
  onPress: () => void;
}

const ProfileRow: React.FC<ProfileRowProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    ...Platform.select({
        ios: {
            fontSize: 16,
        },
        android: {
            fontSize: 13,
        },
    }),
    color: '#4B3F3A',
  },
});

export default ProfileRow;
