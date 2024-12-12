import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavbarProps {
  userName: string;
  unreadCount: number;
  onNotificationsPress: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, unreadCount, onNotificationsPress }) => (
  <View style={styles.navbar}>
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>A Blessed Day,</Text>
      <Text style={styles.userName}>{userName}!</Text>
    </View>
    <TouchableOpacity onPress={onNotificationsPress} style={styles.notificationIcon}>
      <Ionicons name="notifications-outline" size={28} color="#4B3F3A" />
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
    ...Platform.select({
      ios: {
        paddingVertical: 15,
      },
      android: {
        paddingVertical: 10,
      },
  }),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    ...Platform.select({
        ios: {
            fontSize: 16,
        },
        android: {
            fontSize: 13,
        },
    }),
    color: '#6B7280',
  },
  userName: {
    ...Platform.select({
      ios: {
          fontSize: 20,
      },
      android: {
          fontSize: 16,
      },
  }),
    fontWeight: 'bold',
    color: '#333',
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
