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
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const fetchUserId = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error || !sessionData?.session?.user?.id) {
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', 'Could not fetch notifications.');
    } else {
      setNotifications(data || []);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', notificationId);

    if (error) {
      Alert.alert('Error', 'Could not mark the notification as read.');
    } else {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.is_read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.notification_id)}
    >
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#4B3F3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noNotifications}>No notifications available</Text>
          </View>
        }
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
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginLeft: 10,
  },
  listContent: {
    padding: 15,
  },
  notificationCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  unreadNotification: {

    borderWidth: 1,
    borderColor: '#A57A5A', // Brown border for emphasis
  },
  readNotification: {
    backgroundColor: '#F2F2F2', // Neutral light gray for read notifications
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3F3A',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  noNotifications: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
  },
});

export default NotificationsScreen;
