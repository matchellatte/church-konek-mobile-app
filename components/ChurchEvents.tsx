import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,

  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6A5D43', // Previous warm neutral color
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 14,
    marginBottom: 15,
    backgroundColor: '#E2E8F0', // Slightly darker gray
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#2C3E50', // Previous navy blue color
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsContainer: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
  },
});

export default ChurchEvents;
