import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrvhrdvpaywowecfncxj.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydmhyZHZwYXl3b3dlY2ZuY3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MTg2ODYsImV4cCI6MjA0NjI5NDY4Nn0.0afTedHSPuBd62DLmJTnKIohMmStvkk0B_gpW9uD4XU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase client initialized with URL:', supabaseUrl);

// Add AppState listener for session auto-refresh
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    console.log('App is active. Starting auto-refresh.');
    supabase.auth.startAutoRefresh();
  } else {
    console.log('App is inactive. Stopping auto-refresh.');
    supabase.auth.stopAutoRefresh();
  }
});
