// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router';

// const SplashScreen: React.FC = () => {
//   const router = useRouter();

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       router.replace('/intro/get-started1');
//     }, 3000); // Show splash for 3 seconds

//     return () => clearTimeout(timeout);
//   }, [router]);

//   return (
//     <View style={styles.container}>
//       <Image source={require('../../assets/images/splash.png')} style={styles.logo} />
//       <ActivityIndicator size="large" color="#6A5D43" />
//       <Text style={styles.text}>Welcome to Church Konek</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     marginBottom: 20,
//   },
//   text: {
//     fontSize: 18,
//     color: '#333',
//     marginTop: 10,
//   },
// });

// export default SplashScreen;
