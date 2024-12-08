import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Navbar from '../../components/homepage/Navbar';
import ChurchEvents from '../../components/homepage/ChurchEvents';
import MassSchedule from '../../components/homepage/MassSchedule';
import Carousel from '../../components/homepage/carousel';
import Services from '../../components/homepage/services';
import { supabase } from '../../backend/lib/supabase';

const services = [
  { label: 'House Blessing', icon: require('../../assets/icons/house_blessing_icon.png'), screen: '/appointment/house-blessing' },
  { label: 'Funeral Mass', icon: require('../../assets/icons/funeral_mass_icon.png'), screen: '/appointment/funeral-mass' },
  { label: 'Special Mass', icon: require('../../assets/icons/special_mass_icon.png'), screen: '/appointment/special-mass' },
  { label: 'Prayer Intention', icon: require('../../assets/icons/prayer_intention_icon.png'), screen: '/appointment/prayer-intention' },
];

const HomePage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');


  const fetchUserName = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const { id } = data.user || {};
      const { data: profileData, error: profileError } = await supabase
        .from('users') // Ensure this matches your table name
        .select('full_name')
        .eq('user_id', id)
        .single();
      if (profileError) throw profileError;
      setUserName(profileData?.full_name || 'User');
    } catch (err) {
      console.error('Error fetching user name:', err);
      setUserName('User'); // Fallback
    }
  };
  

  interface ChurchEvent {
    id: number;
    title: string;
    date: string;
  }
  const [churchEvents, setChurchEvents] = useState<ChurchEvent[]>([]);
  interface MassSchedule {
    id: number;
    day: string;
    time: string;
  }
  
  const [massSchedule, setMassSchedule] = useState<MassSchedule[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  const { width } = Dimensions.get('window');
  const ITEM_WIDTH = width * 0.9;
  const SPACING = 2;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
    fetchMassSchedule();
    fetchChurchEvents();
    fetchUnreadNotifications();
    fetchUserName();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner')
        .select('image_url'); // Assuming "image_url" column contains the URLs

      if (error) throw error;

      setCarouselImages(data.map((item) => item.image_url)); // Extract URLs from the data
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching banners:', error.message);
      } else {
        console.error('Error fetching banners:', error);
      }
    }
  };

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

        {/* Carousel Section */}
        <Carousel
          images={carouselImages}
          activeIndex={activeIndex}
          onScroll={(index) => setActiveIndex(index)}
        />

        {/* Services Section */}
        <Services
          services={services}
          onNavigate={handleNavigate}
        />

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
    padding: 10,
    marginBottom: 20,
  },
  carouselItem: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 190,
    borderRadius: 10,
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
    backgroundColor: '#D4A373',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#A4501B',
  },
  servicesSection: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B3F3A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8C6A5E',
    fontWeight: '600',
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTile: {
    width: '22%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default HomePage;
