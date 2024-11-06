import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../backend/lib/supabase';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const { width } = Dimensions.get('window');

const HomePage = () => {
  const router = useRouter();
  const [userName] = useState('Grechelle Ann');
  const [searchQuery, setSearchQuery] = useState('');
  
  interface Notification {
    notification_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    user_id: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize notifications with sound settings
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Ask for notification permissions and get the push token
  const registerForPushNotificationsAsync = async () => {
    let token;
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
  
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Notification permissions are required to receive notifications.');
        return;
      }
  
      // Use the projectId from Constants
      const projectId = Constants.manifest?.extra?.eas?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', token);
    } else {
      Alert.alert('Error', 'Must use physical device for Push Notifications');
    }
  
    return token;
  };

  const savePushTokenToDatabase = async (token: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      }
    }
  };

  // MassSchedule and ChurchEvent state and types
  interface MassSchedule {
    id: number;
    day: string;
    time: string;
  }
  
  const [massSchedule, setMassSchedule] = useState<MassSchedule[]>([]);
  interface ChurchEvent {
    id: number;
    title: string;
    date: string;
  }
  
  const [churchEvents, setChurchEvents] = useState<ChurchEvent[]>([]);

  const fetchMassSchedule = async () => {
    const { data, error } = await supabase
      .from('massschedule')
      .select('mass_id, day_of_week, time')
      .order('mass_id', { ascending: true });

    if (error) {
      console.error('Error fetching mass schedule:', error);
    } else {
      setMassSchedule(data.map(item => ({
        id: item.mass_id,
        day: item.day_of_week,
        time: item.time,
      })));
    }
  };

  const fetchChurchEvents = async () => {
    const { data, error } = await supabase
      .from('event')
      .select('event_id, title, event_date')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching church events:', error);
    } else {
      setChurchEvents(data.map(item => ({
        id: item.event_id,
        title: item.title,
        date: item.event_date,
      })));
    }
  };

  const fetchNotifications = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(notif => !notif.is_read).length || 0);
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await registerForPushNotificationsAsync(); // Register for push notifications
      await fetchMassSchedule();
      await fetchChurchEvents();
      await fetchNotifications();

      // Real-time listener for new notifications
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        const notificationsListener = supabase
          .channel(`public:notifications:user_id=eq.${userId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
            const newNotification: Notification = {
              notification_id: payload.new.notification_id,
              message: payload.new.message,
              is_read: payload.new.is_read,
              created_at: payload.new.created_at,
              user_id: payload.new.user_id,
            };
            setNotifications((prev: Notification[]) => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'New Notification',
                body: newNotification.message,
                sound: true, // Play sound on notification
              },
              trigger: null,
            });
          })
          .subscribe();

        return () => {
          notificationsListener.unsubscribe();
        };
      }
    };

    initialize();
  }, []);

  const handleNavigate = (screen: string) => {
    if (screen === '/notifications') {
      setUnreadCount(0);
    }
    router.push(screen as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.navbar}>
          <Text style={styles.greeting}>Hi {userName}!</Text>
          <TouchableOpacity onPress={() => handleNavigate('/notifications')}>
            <Ionicons name="notifications-outline" size={28} color="#333333" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>Bringing the Church closer to you!</Text>

        <TextInput
          style={styles.searchBar}
          placeholder="Search for an appointment..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Image source={require('../../assets/images/image1.png')} style={styles.bannerImage} />

        {/* Church Events Section */}
        <View style={styles.container}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Church Events</Text>
            <TouchableOpacity onPress={() => handleNavigate('/calendar')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {churchEvents.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Mass Schedule Section */}
        <View style={styles.container}>
          <Text style={styles.subSectionTitle}>Mass Schedule</Text>
          {massSchedule.map((item, index) => (
            <View key={index} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text style={styles.scheduleTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333333',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#FFF5EB',
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    width: 150,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C69C6D',
  },
  eventTitle: {
    fontSize: 14,
    color: '#333',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  scheduleDay: {
    fontSize: 14,
    color: '#333',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6A5D43',
    fontWeight: 'bold',
  },
});

export default HomePage;
