import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure to install expo-linear-gradient

interface MassSchedule {
  id: number;
  day: string;
  time: string; // Time in 'HH:mm' format (e.g., '08:00')
}

interface MassScheduleProps {
  schedule: MassSchedule[];
}

const MassSchedule: React.FC<MassScheduleProps> = ({ schedule }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Mass Schedule</Text>
    <View style={styles.scheduleContainer}>
      {schedule.map((item) => {
        const [hours, minutes] = item.time.split(':'); // Parse 'HH:mm'
        const formattedTime = new Date().setHours(Number(hours), Number(minutes), 0);
        const timeString = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(formattedTime);

        return (
          <View key={item.id} style={styles.scheduleRow}>
            <LinearGradient
              colors={['#8C6A5E', '#E0C7B1']} // Gradient from warm brown to beige
              style={styles.accentBar}
            />
            <View style={styles.rowContent}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={styles.timeText}>{timeString}</Text>
            </View>
          </View>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    ...Platform.select({
      ios: {
        fontSize: 18,
      },
      android: {
        fontSize: 15,
      },
    }),
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 15,
    textAlign: 'center',
  },
  scheduleContainer: {
    marginTop: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  accentBar: {
    width: 5,
    height: '100%',
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#4B3F3A', 
  },
  rowContent: {
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },
      android: {
        paddingVertical: 7,
      },
    }),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0D4',
  },
  dayText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    fontWeight: '400',
    color: '#6B7280',
  },
});

export default MassSchedule;
