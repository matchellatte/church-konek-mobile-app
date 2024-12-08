import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, FlatList, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../../backend/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
}

const ChurchCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean; dotColor?: string } }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('event')
      .select('event_id, title, description, event_date');

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    const formattedEvents = (data || []).map((item: any) => ({
      id: item.event_id || Math.random().toString(),
      title: item.title || 'No Title',
      description: item.description || 'No Description',
      event_date: item.event_date ? item.event_date.split('T')[0] : '',
    }));

    setEvents(formattedEvents);

    const markedDatesObject = formattedEvents.reduce((acc: { [key: string]: { marked: boolean; dotColor?: string } }, event) => {
      if (event.event_date) {
        acc[event.event_date] = { marked: true, dotColor: '#6A5D43' };
      }
      return acc;
    }, {});

    setMarkedDates(markedDatesObject);
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const filteredEvents = events.filter((event) => event.event_date && event.event_date === day.dateString);
    setSelectedEvents(filteredEvents);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Church Calendar</Text>
      <Text style={styles.headerDescription}>
        Discover the schedule of events in our church.
      </Text>
      <Calendar
        current={selectedDate || undefined}
        markedDates={{
          ...markedDates,
          ...(selectedDate && { [selectedDate]: { selected: true, selectedColor: '#6A5D43' } }),
        }}
        onDayPress={handleDayPress}
        theme={{
          selectedDayBackgroundColor: '#6A5D43',
          todayTextColor: '#C69C6D',
          arrowColor: '#6A5D43',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textSectionTitleColor: '#6A5D43',
          calendarBackground: '#F7FAFC',
          dayTextColor: '#2C3E50',
        }}
        style={styles.calendar}
      />
      <View style={styles.detailsContainer}>
        {selectedEvents.length > 0 ? (
          <>
            <Text style={styles.eventListTitle}>Events on {selectedDate}:</Text>
            <FlatList
              data={selectedEvents}
              keyExtractor={(item) => item.id}
              renderItem={renderEvent}
              contentContainerStyle={styles.eventList}
            />
          </>
        ) : (
          <Text style={styles.noEventsText}>
            {selectedDate ? `No events on ${selectedDate}` : 'Select a date to see events.'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',

  },
  headerText: {
    ...Platform.select({
      ios: {
        fontSize: 28,
      },
      android: {
        fontSize: 22,
    }
  }),
    fontWeight: '700',
    color: '#4B3F3A',
    marginTop: 20,
    marginLeft: 20,
  },
  headerDescription: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 12,
    }
  }),

    fontWeight: '400',
    color: '#857F72',
    marginLeft: 20,
    marginTop: 5,
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for event details
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  eventListTitle: {
    ...Platform.select({
      ios: {
        fontSize: 18,
      },
      android: {
        fontSize: 14,
    }
  }),
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  eventList: {
    paddingBottom: 15,
  },
  eventCard: {
    backgroundColor: '#FFF5EB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventTitle: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 12,
    }
  }),
    fontWeight: 'bold',
    color: '#6A5D43',
    marginBottom: 5,
  },
  eventDescription: {
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 12,
    }
  }),
    color: '#4A5568',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChurchCalendar;
