import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAll }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    ...Platform.select({
        ios: {
            fontSize: 20,
        },
        android: {
            fontSize: 15,
        },
    }),
    fontWeight: '700',
    color: '#4B3F3A',
  },
  seeAll: {
    ...Platform.select({
        ios: {
            fontSize: 14,
        },
        android: {
            fontSize: 11,
        },
    }),
    color: '#8C6A5E',
    fontWeight: '600',
  },
});

export default SectionHeader;
