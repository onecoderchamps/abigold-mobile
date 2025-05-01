import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otpInput.trim()) {
      Alert.alert("Error", "OTP tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('otp')
        .where('phone', '==', phoneNumber)
        .where('otp', '==', otpInput)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const otpDoc = snapshot.docs[0];
        const createdAt = otpDoc.data().createdAt.toDate(); // Waktu OTP dibuat
        const currentTime = new Date();

        // Cek apakah OTP sudah lebih dari 5 menit
        const timeDifference = (currentTime - createdAt) / 1000 / 60; // dalam menit

        if (timeDifference > 5) {
          Alert.alert("Gagal", "OTP telah kedaluwarsa.");
          // await firestore().collection('otp').doc(otpDoc.id).delete(); // Hapus OTP yang kedaluwarsa
        } else {
          // OTP valid, hapus OTP dan navigasi ke halaman berikutnya
          await firestore().collection('otp').doc(otpDoc.id).delete();
          await AsyncStorage.setItem('uid', otpDoc.data().uid);
        }
      } else {
        Alert.alert("Gagal", "OTP tidak valid.");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat memverifikasi OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Masukkan OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan OTP"
        keyboardType="numeric"
        value={otpInput}
        onChangeText={setOtpInput}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonLoading]}
        onPress={verifyOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#214937",
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  button: {
    backgroundColor: '#F3C623',  // Same background as the header color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoading: {
    backgroundColor: '#777',  // Darken the color when loading
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OtpVerificationScreen;
