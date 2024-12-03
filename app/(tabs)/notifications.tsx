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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId(); // Fetch the current user's ID
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchUserId = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error || !sessionData?.session?.user?.id) {
      console.error('Error fetching user session:', error);
      Alert.alert('Error', 'Could not retrieve user session. Please log in again.');
      return;
    }

    setUserId(sessionData.session.user.id);
  };

  const fetchNotifications = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('notification_id, message, is_read, created_at')
      .eq('user_id', userId) // Fetch notifications for the current user
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
        .select(); // Fetch updated row for verification

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
    backgroundColor: '#F9FAFB', // Soft light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF', // White background for header
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Subtle divider
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Dark gray for text
    marginLeft: 10,
  },
  listContent: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF', // White background for unread notifications
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  readNotification: {
    backgroundColor: '#F3F4F6', // Light gray background for read notifications
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // Neutral dark gray for text
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6B7280', // Muted gray for date text
  },
  noNotifications: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9CA3AF', // Muted gray for empty state
    marginTop: 20,
  },
});


export default NotificationsScreen;
