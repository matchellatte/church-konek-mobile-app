import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../../backend/lib/supabase';

interface Event {
  id: string; // UUID from Supabase
  title: string;
  description: string;
  event_date: string; // Timestamp format
}

const ChurchCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean; dotColor?: string } }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  useEffect(() => {
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

    const formattedEvents = data.map((item: any) => ({
      id: item.event_id,
      title: item.title,
      description: item.description,
      event_date: item.event_date.split('T')[0], // Extract only the date part
    }));

    setEvents(formattedEvents);

    // Generate marked dates for the calendar
    const markedDatesObject = formattedEvents.reduce((acc, event) => {
      acc[event.event_date] = { marked: true, dotColor: '#6A5D43' }; // Customize dot color
      return acc;
    }, {} as { [key: string]: { marked: boolean; dotColor?: string } });

    setMarkedDates(markedDatesObject);
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const filteredEvents = events.filter((event) => event.event_date === day.dateString);
    setSelectedEvents(filteredEvents);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Church Calendar</Text>
      <Calendar
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
      <View style={styles.eventsContainer}>
        {selectedEvents.length > 0 ? (
          <>
            <Text style={styles.eventListTitle}>Events on {selectedDate}:</Text>
            <FlatList
              data={selectedEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDescription}>{item.description}</Text>
                </View>
              )}
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
    padding: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  eventListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#FFF5EB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A5D43',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
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
