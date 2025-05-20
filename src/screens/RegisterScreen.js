import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard,
  TouchableOpacity
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { getAppKey, getAuthKey } from '../api/functions';

const RegisterScreen = ({ navigation }) => {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('628')) return '+' + cleaned;
    if (cleaned.startsWith('+628')) return cleaned;
    return '+62' + cleaned;
  };

  const checkPhoneExists = async (formattedPhone) => {
    const snapshot = await firestore()
      .collection('users')
      .where('phone', '==', formattedPhone)
      .limit(1)
      .get();
    return !snapshot.empty;
  };

  const handleRegister = async () => {
    if (!fullname || !phone || !email) {
      Alert.alert('Error', 'Semua field wajib diisi.');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    setLoading(true);

    try {
      const exists = await checkPhoneExists(formattedPhone);
      if (exists) {
        Alert.alert("Error", "Nomor ponsel sudah terdaftar.");
        setLoading(false);
        return;
      }

      const appKey = await getAppKey();
      const authKey = await getAuthKey();
      const otp = generateOtp();

      const response = await fetch('https://app.saungwa.com/api/create-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formattedPhone,
          authkey: authKey.key,
          appkey: appKey.key,
          message: `Kode OTP Anda adalah ${otp}`
        }),
      });

      const data = await response.text();

      if (response.ok) {

        const userData = {
          name: fullname,
          email,
          address:"",
          phone: formattedPhone,
          komisi:0,
          updatedAt: firestore.FieldValue.serverTimestamp(),
      };
        // Simpan ke Firestore
        const userRef = await firestore().collection('users').add({
          ...userData,
          parent: "",
          header: "",
          balance: 0,
          roles:"User",
          referal: Math.floor(10000 + Math.random() * 90000).toString(),
          isActive: true,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        // Simpan OTP
        await firestore().collection('otp').add({
          uid: userRef.id,
          phone: formattedPhone,
          otp: otp,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        navigation.navigate('Otp', { phoneNumber: formattedPhone, otp });
      } else {
        Alert.alert("Gagal", data || 'Gagal mengirim OTP.');
      }
    } catch (err) {
      Alert.alert('Error', 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.bottomContainer}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap"
              value={fullname}
              onChangeText={setFullname}
              editable={!loading}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.label}>Nomor Ponsel</Text>
            <TextInput
              style={styles.input}
              placeholder="Cth 081234567890"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Mendaftarkan...' : 'Daftar'}
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
    marginBottom: 8,
    fontSize: 16,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#F3C623',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonLoading: {
    backgroundColor: '#777',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
