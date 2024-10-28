import { S3Client } from '@aws-sdk/client-s3';
import { supabase } from '../../backend/lib/supabase'; 

const createS3Client = async () => {
  // Fetch session token from Supabase auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('User is not authenticated');
  }

  const client = new S3Client({
    forcePathStyle: true, // Required for Supabase S3
    region: 'ap-southeast-1', // Replace with your Supabase region
    endpoint: 'https://raaxybcfkdowqfgblknl.supabase.co/storage/v1/s3',
    credentials: {
      accessKeyId: 'raaxybcfkdowqfgblknl', // Project Reference ID
      secretAccessKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYXh5YmNma2Rvd3FmZ2Jsa25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzOTgzMzMsImV4cCI6MjA0Mzk3NDMzM30.1j3_KonHIV1bnUdFpjCfp_1vHV3zEgZgx6hhunbSSNc', // Supabase anon key
      sessionToken: session.access_token, // User's JWT token
    },
  });

  return client;
};

export default createS3Client;
