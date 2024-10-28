import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../backend/lib/supabase';

interface ChurchEvent {
  id: number;
  title: string;
  date: string;
}

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean; dotColor: string } }>({});
  const [churchEvents, setChurchEvents] = useState<{ [key: string]: ChurchEvent[] }>({});

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Fetch church events from Supabase
  const fetchChurchEvents = async () => {
    const { data, error } = await supabase
      .from('church_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching church events:', error);
      Alert.alert('Error', 'Failed to fetch church events');
      return;
    }

    // Group events by date
    const eventsByDate: { [key: string]: ChurchEvent[] } = {};
    data.forEach((event: ChurchEvent) => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = [];
      }
      eventsByDate[event.date].push(event);
    });

    // Mark the dates with events
    const marked: { [key: string]: { marked: boolean; dotColor: string } } = {};
    Object.keys(eventsByDate).forEach((date) => {
      marked[date] = { marked: true, dotColor: '#C69C6D' };
    });

    setChurchEvents(eventsByDate);
    setMarkedDates(marked);
  };

  useEffect(() => {
    fetchChurchEvents();
  }, []);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDay(day.dateString);
  };

  const changeMonth = (direction: 'next' | 'prev') => {
    let newMonth = new Date(currentDate);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newMonth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Church Calendar</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => changeMonth('prev')}>
            <Ionicons name="chevron-back-outline" size={24} color="#6A5D43" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth('next')}>
            <Ionicons name="chevron-forward-outline" size={24} color="#6A5D43" />
          </TouchableOpacity>
        </View>

        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            key={currentDate.toString()}
            current={formatDate(currentDate)}
            markedDates={{
              ...markedDates,
              [selectedDay]: { selected: true, selectedColor: '#C69C6D' },
            }}
            onDayPress={handleDayPress}
            hideArrows={true}
            hideExtraDays={true}
            disableMonthChange={true}
          />
        </View>

        {/* Event Details */}
        <ScrollView contentContainerStyle={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>
            {selectedDay ? `Events on ${selectedDay}` : 'Select a date to view events'}
          </Text>
          {churchEvents[selectedDay]?.length > 0 ? (
            churchEvents[selectedDay].map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <Text style={styles.eventText}>{event.title}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events on this date.</Text>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A5D43',
  },
  calendarContainer: {
    padding: 10,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5D43',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#FFF5EB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 16,
    color: '#333',
  },
  noEventsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CalendarScreen;
