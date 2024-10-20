import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: any, selectedDate: Date | undefined) => {
    setShowPicker(false);
    if (selectedDate) onDateChange(selectedDate);
  };

  return (
    <View>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>
          {date ? date.toDateString() : 'Select a date'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker 
          value={date || new Date()} 
          mode="date" 
          display="default" 
          onChange={handleChange} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default DatePicker;
