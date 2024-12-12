import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Platform} from 'react-native';

interface ServiceTileProps {
  label: string;
  icon: any;
  onPress: () => void;
}

const ServiceTile: React.FC<ServiceTileProps> = ({ label, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
        ios: {
            height: 120,
        },
        android: {
            height: 100,
        },
    }),
    width: '30%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 40,
    height: 40,
  },
  label: {
    ...Platform.select({
        ios: {
            fontSize: 14,
        },
        android: {
            fontSize: 10,
    }
}),
    marginTop: 8,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default ServiceTile;
