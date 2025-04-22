/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Image, StyleSheet } from 'react-native';
import OrderScreen from '../screens/OrderScreen';
import AccountScreen from '../screens/AccountScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailScreen from '../screens/FastRide/ChoiceScreen';
import AgentScreen from '../screens/FastRide/AgentScreen';
import OrderCheckOutScreen from '../screens/FastRide/OrderCheckoutScreen';
import OrderCheckAgentOut from '../screens/FastRide/OrderCheckoutAgentScreen';
import AccountAgentScreen from '../screens/OrderAgenScreen';
import MemberAgentScreen from '../screens/FastRide/CreaterMemberScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={MainNavigator} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{
      title: 'Detail',
      headerStyle: { 
        backgroundColor: '#214937', 
        elevation: 0, // Menghilangkan shadow di Android
        shadowOpacity: 0, // Menghilangkan shadow di iOS
        alignItems: 'center',
      },
      headerTitleAlign: 'center',
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: 'normal',fontFamily:'Montserrat-Regular' },
      headerShown: true,
    }} />
    <Stack.Screen name="OrderCheckOutScreen" component={OrderCheckOutScreen} options={{
      title: 'Order',
      headerStyle: { 
        backgroundColor: '#214937', 
        elevation: 0, // Menghilangkan shadow di Android
        shadowOpacity: 0, // Menghilangkan shadow di iOS
        alignItems: 'center',
      },
      headerTitleAlign: 'center',
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: 'normal',fontFamily:'Montserrat-Regular' },
      headerShown: true,
    }} />
    <Stack.Screen name="OrderCheckOutAgentScreen" component={OrderCheckAgentOut} options={{
      title: 'OrderAgent',
      headerStyle: { 
        backgroundColor: '#214937', 
        elevation: 0, // Menghilangkan shadow di Android
        shadowOpacity: 0, // Menghilangkan shadow di iOS
        alignItems: 'center',
      },
      headerTitleAlign: 'center',
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: 'normal',fontFamily:'Montserrat-Regular' },
      headerShown: true,
    }} />
    <Stack.Screen name="Agent" component={AgentScreen} options={{
      title: 'Mitra ABI',
      headerStyle: { 
        backgroundColor: '#214937', 
        elevation: 0, // Menghilangkan shadow di Android
        shadowOpacity: 0, // Menghilangkan shadow di iOS
        alignItems: 'center',
      },
      headerTitleAlign: 'center',
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: 'normal',fontFamily:'Montserrat-Regular' },
      headerShown: true,
    }} />
    <Stack.Screen name="MemberAgent" component={MemberAgentScreen} options={{
      title: 'Member',
      headerStyle: { 
        backgroundColor: '#214937', 
        elevation: 0, // Menghilangkan shadow di Android
        shadowOpacity: 0, // Menghilangkan shadow di iOS
        alignItems: 'center',
      },
      headerTitleAlign: 'center',
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: 'normal',fontFamily:'Montserrat-Regular' },
      headerShown: true,
    }} />
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
      name="Aktifitas"
      component={OrderScreen}
      options={{
        tile: 'Home Page',
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
      name="Member"
      component={AccountAgentScreen}
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
