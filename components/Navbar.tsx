import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavbarProps {
  userName: string;
  unreadCount: number;
  onNotificationsPress: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, unreadCount, onNotificationsPress }) => (
  <View style={styles.navbar}>
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.userName}>{userName}!</Text>
    </View>
    <TouchableOpacity onPress={onNotificationsPress} style={styles.notificationIcon}>
      <Ionicons name="notifications-outline" size={28} color="#2C3E50" />
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,

    marginBottom: 15,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 16,
    color: '#4A5568',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  notificationIcon: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Navbar;
