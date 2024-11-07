import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';

interface Notification {
  notification_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('notification_id, message, is_read, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Could not fetch notifications.');
    } else {
      setNotifications(data || []);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId)
        .select(); // This fetches the updated row for verification
  
      if (error) {
        console.error('Error marking notification as read:', error);
        Alert.alert('Error', 'Could not mark the notification as read.');
      } else if (data) {
        console.log('Notification marked as read:', data);
        
        // Update the local state to reflect the read status immediately
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notification_id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Unexpected error marking notification as read:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.is_read && styles.readNotification]}
      onPress={() => markAsRead(item.notification_id)}
    >
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.notificationDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.noNotifications}>No notifications</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  listContent: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  readNotification: {
    backgroundColor: '#EFEFEF',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  noNotifications: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default NotificationsScreen;
 