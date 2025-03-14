import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

const AccountScreen = () => {

  const signOut = async () => {
    try {
      // await auth().signOut();
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('uid');
      // Alert.alert('Logged Out', 'You have been logged out.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Akun</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white' }}>
        <TouchableOpacity onPress={signOut}>
          <View style={{ borderRadius: 20, width: width - 100, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#214937' }}>
            <Text style={{ fontFamily: 'Montserrat-Regular', color: 'white' }}>Keluar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#214937',
    width: width,
    padding: 20,
    fontFamily: 'Montserrat-Regular'
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default AccountScreen;
