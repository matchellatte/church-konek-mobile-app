import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';

interface Service {
  label: string;
  icon: any;
  screen: string;
}

interface ServicesProps {
  services: Service[];
  onNavigate: (screen: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, onNavigate }) => {
  return (
    <View style={styles.servicesSection}>
      <View style={styles.servicesHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
        <TouchableOpacity onPress={() => onNavigate('/appointment')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.servicesRow}>
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceTile}
            onPress={() => onNavigate(service.screen)}
          >
            <Image source={service.icon} style={styles.serviceIcon} />
            <Text style={styles.serviceLabel}>{service.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  servicesSection: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...Platform.select({
        ios: {
          fontSize: 25,
        },
        android: {
          fontSize: 18,
      }
    }),
    fontWeight: '700',
    color: '#4B3F3A',
  },
  seeAllText: {
    ...Platform.select({
        ios: {
          fontSize: 16,
        },
        android: {
          fontSize: 13,
      }
    }),
    color: '#8C6A5E',
    fontWeight: '600',
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTile: {
    width: '22%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  serviceLabel: {
    ...Platform.select({
        ios: {
            fontSize: 11,
        },
        android: {
            fontSize: 9,
        },
    }),
    marginTop: 8,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default Services;
