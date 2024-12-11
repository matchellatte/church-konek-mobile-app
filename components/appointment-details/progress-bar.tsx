import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // Progress as a value between 0 and 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <View style={styles.container}>
    <View style={[styles.filler, { width: `${progress * 100}%` }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  filler: {
    height: '100%',
    backgroundColor: '#4CAF50', // Green
  },
});

export default ProgressBar;
