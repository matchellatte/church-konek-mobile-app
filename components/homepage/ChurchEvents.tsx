import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface Event {
  id: number;
  title: string;
  date: string;
}

interface ChurchEventsProps {
  events: Event[];
  onViewAll: () => void;
}

const ChurchEvents: React.FC<ChurchEventsProps> = ({ events, onViewAll }) => (
  <View style={styles.container}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Church Events</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.gridContainer}>
      {events.slice(0, 4).map((event) => (
        <TouchableOpacity key={event.id} style={styles.eventCard}>
          <View style={styles.cardContent}>
            <View style={styles.dateContainer}>
              <Text style={styles.dayText}>
                {new Date(event.date).getDate()}
              </Text>
              <Text style={styles.monthText}>
                {new Date(event.date)
                  .toLocaleString('default', { month: 'short' })
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    ...Platform.select({
      ios: {
        fontSize: 22,
        marginBottom: 5,
      },
      android: {
        fontSize: 18,
        marginBottom: 2,
      },
    }),
    fontWeight: '700',
    color: '#4B3F3A',
  },
  viewAllText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: '#8C6A5E',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCard: {
    width: Platform.OS === 'ios' ? '48%' : '48%',
    aspectRatio: Platform.OS === 'ios' ? 1.2 : 1,
    borderRadius: 14,
    marginBottom: Platform.OS === 'ios' ? 15 : 10,
    backgroundColor: '#F9F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 15 : 10,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#8C6A5E',
    borderRadius: 50,
    width: Platform.OS === 'ios' ? 60 : 50,
    height: Platform.OS === 'ios' ? 60 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  dayText: {
    fontSize: Platform.OS === 'ios' ? 20 : 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthText: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsContainer: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: Platform.OS === 'ios' ? 14 : 11,
    fontWeight: '700',
    color: '#4B3F3A',
    textAlign: 'center',
    marginBottom: Platform.OS === 'ios' ? 5 : 3,
  },
  eventTime: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: '500',
    color: '#6A5048',
  },
});

export default ChurchEvents;
