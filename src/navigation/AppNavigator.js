/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AppNavigator = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [isLoggedIn, setisLoggedIn] = useState(false);


  // Handle user state changes
  async function onAuthStateChanged() {
    const user = await AsyncStorage.getItem('uid');
    if (user !== null) {
      setisLoggedIn(true);
    } else {
      setisLoggedIn(false);
    }
  }
  
  useEffect(() => {
    setInterval(onAuthStateChanged, 500);
  }, []);

  return (
    // <SafeAreaView>
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
    // </SafeAreaView>
  );
};

export default AppNavigator;
