import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Home Page', headerShown: false }}
      />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{
          title: 'OTP',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#214937', // Mengatur warna latar belakang header
          },
          headerTintColor: '#fff', // Mengatur warna teks header menjadi putih
        }}
      />
    </Stack.Navigator>
  );
}
