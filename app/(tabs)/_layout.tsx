// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import BottomNavbar from '../../components/BottomNavbar';

export default function RootLayout() {
  return (
    <>
      <Slot />
      <BottomNavbar />
    </>
  );
}
