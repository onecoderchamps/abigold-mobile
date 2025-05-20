/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Image, StyleSheet } from 'react-native';
import OrderScreen from '../screens/OrderScreen';
import AccountScreen from '../screens/AccountScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={MainNavigator} />
  </Stack.Navigator>
  
);

const MainNavigator = () => (
  <Tab.Navigator screenOptions={{
    tabBarStyle: styles.tabBarStyle, // Custom tab bar style
    tabBarShowLabel: true, // Hide labels (optional)
    tabBarActiveTintColor: '#000000', // Active icon color
    tabBarInactiveTintColor: '#00000050', // Inactive icon color

  }}>
    <Tab.Screen
      name="Beranda"
      component={HomeScreen}
      options={{
        tile: 'Home Page',
        headerShown: false,
        color: '#fff',
        fontFamily:'Montserrat-Regular',
        tabBarIcon: ({ focused }) => {
          const size = focused ? 30 : 20;
          return (
            <Image
              source={require('../asset/logo.png')}  // Local image
              style={{ width: size + 20, height: size, tintColor:'#214937' }}
            />
          );
        },
      }}
    />
    <Tab.Screen
      name="Order"
      component={OrderScreen}
      options={{
        tile: 'Order Emas',
        headerShown: false,
        color: '#fff',
        fontFamily:'Montserrat-Regular',
        tabBarIcon: ({ focused }) => {
          const size = focused ? 25 : 20;
          return (
            <Image
              source={require('../asset/package.png')}  // Local image
              style={{ width: size, height: size }}
            />
          );
        },
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        tile: 'Home Page',
        headerShown: false,
        color: '#fff',
        fontFamily:'Montserrat-Regular',
        tabBarIcon: ({ focused }) => {
          const size = focused ? 25 : 20;
          return (
            <Image
              source={require('../asset/account.png')}  // Local image
              style={{ width: size, height: size }}
            />
          );
        },
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarStyle: {
    height: 60,
  },
  image: {
    width: 30, // Specify width
    height: 30, // Specify height
  },
  tabBarIconStyle: {
    justifyContent: 'center',  // Center the icon vertically within the tab
    alignItems: 'center',  // Center the icon horizontally within the tab
    fontFamily:'Montserrat-Regular'
  },
});

export default HomeStack;
