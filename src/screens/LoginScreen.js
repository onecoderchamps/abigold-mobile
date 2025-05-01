import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard,
  TouchableOpacity
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('628')) return '+' + cleaned;
    if (cleaned.startsWith('+628')) return cleaned;
    return '+62' + cleaned;
  };

  const checkPhoneInFirebase = async (formattedPhone) => {
    const snapshot = await firestore()
      .collection('users')
      .where('phone', '==', formattedPhone)
      .limit(1)
      .get();
    return !snapshot.empty;
  };

  const sendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Nomor ponsel tidak boleh kosong.");
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    setLoading(true);
    try {
      const exists = await checkPhoneInFirebase(formattedPhone);
      if (!exists) {
        Alert.alert("Error", "Nomor ponsel tidak terdaftar.");
        setLoading(false);
        return;
      }

      // Cek apakah akun sudah diaktifkan
      const userSnapshot = await firestore()
        .collection('users')
        .where('phone', '==', formattedPhone)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        if (userData.isActive === false) {
          Alert.alert("Akun Belum Diaktivasi", "Akun Anda belum diaktifkan. Silakan hubungi admin.");
          setLoading(false);
          return;
        }
      }

      const otp = generateOtp();

      const response = await fetch('https://app.saungwa.com/api/create-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formattedPhone,
          authkey: "Z8hxOuMsQapmnfe3GFkNbmgWMuOLLcVxnU1oO6fufLFKy0bpS4",
          appkey: "165ba4e8-713c-40e2-92a5-3696ae54d45f",
          message: `Kode OTP Anda adalah ${otp}`
        }),
      });

      const data = await response.text();

      if (response.ok) {
        const otpRef = firestore().collection('otp');
        const existing = await otpRef.where('phone', '==', formattedPhone).limit(1).get();

        if (!existing.empty) {
          // Jika sudah ada, update OTP-nya
          const docId = existing.docs[0].id;
          await otpRef.doc(docId).update({
            otp: otp,
            createdAt: firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Jika belum ada, buat baru
          const otpRefs = firestore().collection('users');
          const existings = await otpRefs.where('phone', '==', formattedPhone).limit(1).get();
          const docId = existings.docs[0].id;
          await otpRef.add({
            uid: docId,
            phone: formattedPhone,
            otp: otp,
            createdAt: firestore.FieldValue.serverTimestamp()
          });
        }
        navigation.navigate('Otp', { phoneNumber: formattedPhone, otp });
      } else {
        Alert.alert('Gagal', data || 'Terjadi kesalahan saat mengirim OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memeriksa data atau mengirim OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={require('../asset/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.bottomContainer}>
            <Text style={styles.label}>Masukkan Nomor Ponsel</Text>
            <TextInput
              style={styles.input}
              placeholder="Cth 081234567890"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={sendOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Mengirim...' : 'Konfirmasi'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#214937",
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 120,
    width: 120,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
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

export default LoginScreen;
