import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Image, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../config/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

GoogleSignin.configure({
  webClientId: '290388008770-1151p3htr6rah2dnhncp308544in90ck.apps.googleusercontent.com', // Replace with your web client ID from Firebase
});

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
 
   const signInWithGoogle = async () => {
     try {
       const signInResult = await GoogleSignin.signIn();
       const idToken = signInResult.data?.idToken;
       const googleCredential = auth.GoogleAuthProvider.credential(idToken);
       const userCredential = await auth().signInWithCredential(googleCredential);
 
       const { uid, displayName, phoneNumber, email } = userCredential.user;
       // Ambil FCM Token
       const fcmToken = await messaging().getToken();
 
       // Cek apakah pengguna sudah ada di Firestore
       const userDoc = await firestore().collection('users').doc(uid).get();
 
       if (!userDoc.exists) {
         // Jika user belum ada, buat data baru
         await firestore().collection('users').doc(uid).set({
           fullname: displayName || '',
           phonenumber: phoneNumber || '',
           balance: 0,
           point: 0,
           uid: uid,
           alamat: '',
           nomorrekening: '',
           fcmToken: fcmToken,
           isAgent: false,
           imageKtp:'',
           noNik:'',
           namaKtp:'',
           codeReferal: generateReferralCode(),
         });
         setUser(userCredential.user);
         await AsyncStorage.setItem('uid', uid);
 
       } else {
         await firestore().collection('users').doc(uid).update({
           fcmToken: fcmToken
         });
         setUser(userCredential.user);
         await AsyncStorage.setItem('uid', uid);
       }
     } catch (error) {
      console.log(error);
       Alert.alert('Error', error.message);
     }
   };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../asset/logo.png')} // Ganti dengan path logo Anda
          style={styles.logo}
        />
        {/* <Text style={styles.textDesc2}>Hallo</Text> */}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={signInWithGoogle}>
          <View style={{ borderRadius: 20, width: width - 100, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontFamily: 'Montserrat-Regular', color: '#214937' }}>Lanjutkan Dengan Google</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Memberi ruang di atas dan bawah layar
    backgroundColor: '#214937'
  },
  textDesc: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'bold',
    color: 'white',
    fontFamily: 'Montserrat-Bold'
  },
  textDesc2: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'normal',
    color: 'white',
    fontFamily: 'Montserrat-Regular',
    paddingTop: 20
  },
  logoContainer: {
    flexGrow: 1, // Membuat logo tetap di tengah
    justifyContent: 'center',
    alignItems: "center"
  },
  logo: {
    width: width / 3,
    height: width / 7,
  },
  buttonContainer: {
    width: '100%', // Tombol memenuhi lebar layar
    paddingHorizontal: 20, // Jarak dari sisi layar
    marginBottom: 20, // Jarak dari bawah layar
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default LoginScreen;
