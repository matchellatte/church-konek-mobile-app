import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  View 
} from 'react-native';
import { supabase } from '../../../backend/lib/supabase';


interface PrayerIntention {
  prayer_intention_id: string;
  user_id: string;
  full_name: string;
  contact_number: string;
  prayer_text: string;
  status: string;
}

const PrayerIntention = () => {
  
  const [prayerIntentions, setPrayerIntentions] = useState<PrayerIntention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerIntentions = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError.message);
          return;
        }

        if (!user) {
          console.log('No authenticated user found');
          setPrayerIntentions([]);
          return;
        }

        const { data, error } = await supabase
          .from('prayerintentionforms')
          .select('prayer_intention_id, user_id, full_name, contact_number, prayer_text, status')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching prayer intentions:', error.message);
          return;
        }

        setPrayerIntentions(data || []);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerIntentions();
  }, []);

  const renderPrayerCard = ({ item }: { item: PrayerIntention }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <Text style={styles.fullName}>{item.full_name}</Text>
        <Text style={[styles.status, item.status === 'pending' ? styles.pending : styles.answered]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.prayerText}>{item.prayer_text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Prayer Intentions</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : prayerIntentions.length > 0 ? (
        <FlatList
          data={prayerIntentions}
          keyExtractor={(item) => item.prayer_intention_id}
          renderItem={renderPrayerCard}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No prayer intentions yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#007BFF',
  },
  prayerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  prayerText: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  pending: {
    color: '#FFA500', 
  },
  answered: {
    color: '#28A745', 
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});

export default PrayerIntention;