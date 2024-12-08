import React from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarDatePickerProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  eventDates: string[];
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  setSelectedDate,
  eventDates,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Choose an appointment date <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.sectionDescription}>
        Select an available date for your appointment. Dates marked in light gray are unavailable.
      </Text>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#6A5D43' },
          ...eventDates.reduce(
            (acc, date) => ({
              ...acc,
              [date]: {
                disabled: true,
                disableTouchEvent: true,
                dotColor: 'red',
                customStyles: {
                  text: { color: 'gray' },
                },
              },
            }),
            {}
          ),
        }}
        theme={{
          selectedDayBackgroundColor: '#6A5D43',
          todayTextColor: '#C69C6D',
          arrowColor: '#6A5D43',
          textDayFontWeight: 'bold',
          textDisabledColor: 'gray',
        }}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    ...Platform.select({
        ios: {
            fontSize: 20,
        },
        android: {
            fontSize: 15,
        },
    }),
    fontWeight: 'bold',
    color: '#4B3F3A',
    marginBottom: 10,
  },
  sectionDescription: {
    ...Platform.select({
        ios: {
            fontSize: 14,
        },
        android: {
            fontSize: 11,
        },
    }),
    color: '#6B7280',
    marginBottom: 20,
  },
  required: {
    color: 'red',
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
});

export default CalendarDatePicker;
