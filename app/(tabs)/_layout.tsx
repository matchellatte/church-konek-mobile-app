import React from 'react';
import { Slot, useSegments } from 'expo-router';
import BottomNavbar from '../../components/BottomNavbar';

export default function RootLayout() {
  const segments = useSegments();

  // List of routes where the BottomNavbar should be hidden
  const hideBottomNavbarRoutes = ['/appointment/wedding','/notifications'];

  // Check if the current route matches any in the hide list
  const shouldHideNavbar = hideBottomNavbarRoutes.some((route) =>
    segments.join('/').endsWith(route)
  );

  return (
    <>
      <Slot />
      {!shouldHideNavbar && <BottomNavbar />}
    </>
  );
}
