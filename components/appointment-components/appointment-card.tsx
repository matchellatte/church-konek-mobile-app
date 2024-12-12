import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentCardProps {
  type: string;
  date: string;
  status: string;
  onPress: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ type, date, status, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons
        name="calendar-outline"
        size={24}
        color="#6B7280"
        style={styles.icon}
      />
      <View style={styles.info}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.status}>{status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: '#F9F5F0',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  type: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#857F72',
  },
  status: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: '#A57A5A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
});

export default AppointmentCard;
