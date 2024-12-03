import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  View,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Navbar from '../../components/Navbar';
import ChurchEvents from '../../components/ChurchEvents';
import MassSchedule from '../../components/MassSchedule';
import { supabase } from '../../backend/lib/supabase';

interface LocalMassSchedule {
  id: number;
  day: string;
  time: string;
}

interface LocalChurchEvent {
  id: number;
  title: string;
  date: string;
}

const HomePage = () => {
  const router = useRouter();
  const [userName] = useState('Grechelle Ann');
  const [searchQuery, setSearchQuery] = useState('');
  const [churchEvents, setChurchEvents] = useState<LocalChurchEvent[]>([]);
  const [massSchedule, setMassSchedule] = useState<LocalMassSchedule[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carousel images
  const carouselImages = [
    require('../../assets/images/banner-2.png'),
    require('../../assets/images/banner-1.png'),
    require('../../assets/images/banner-3.png'),
  ];

  // Screen dimensions
  const { width } = Dimensions.get('window');
  const ITEM_WIDTH = width * 0.9; // 90% of the screen width
  const SPACING = 10; // Spacing between items

  const [activeIndex, setActiveIndex] = useState(0); // Track active index

  useEffect(() => {
    fetchMassSchedule();
    fetchChurchEvents();
    fetchUnreadNotifications();
  }, []);

  const fetchMassSchedule = async () => {
    const { data, error } = await supabase
      .from('massschedule')
      .select('mass_id, day_of_week, time');
    if (error) {
      console.error('Error fetching mass schedule:', error);
      return;
    }
    setMassSchedule(
      (data || []).map((item) => ({
        id: item.mass_id,
        day: item.day_of_week,
        time: item.time,
      }))
    );
  };

  const fetchChurchEvents = async () => {
    const { data, error } = await supabase
      .from('event')
      .select('event_id, title, event_date');
    if (error) {
      console.error('Error fetching church events:', error);
      return;
    }
    setChurchEvents(
      (data || []).map((item) => ({
        id: item.event_id,
        title: item.title,
        date: item.event_date,
      }))
    );
  };

  const fetchUnreadNotifications = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      setUnreadCount(data?.length || 0);
    }
  };

  const handleNavigate = (screen: string) => {
    if (screen === '/notifications') {
      setUnreadCount(0); // Reset unread count when navigating to notifications
    }
    router.push(screen as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Navbar
          userName={userName}
          unreadCount={unreadCount}
          onNotificationsPress={() => handleNavigate('/notifications')}
        />
        <View style={styles.carouselContainer}>
          <FlatList
            data={carouselImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.carouselItem, { width: ITEM_WIDTH, marginRight: SPACING }]}>
                <Image source={item} style={styles.carouselImage} />
              </View>
            )}
            onScroll={(e) => {
              const contentOffsetX = e.nativeEvent.contentOffset.x;
              const currentIndex = Math.round(contentOffsetX / (ITEM_WIDTH + SPACING));
              setActiveIndex(currentIndex);
            }}
          />
          <View style={styles.dotsContainer}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>
        </View>
        <ChurchEvents
          events={churchEvents}
          onViewAll={() => handleNavigate('/calendar')}
        />
        <MassSchedule schedule={massSchedule} />
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
    padding: 10,
  },
  carouselContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF', // White container background
    borderRadius: 15, // Rounded corners
    padding: 10, 
  },
  carouselItem: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4A373', // Muted orange-brown for inactive dots
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#A4501B', // Darker orange-brown for active dots
  },
});

export default HomePage;

