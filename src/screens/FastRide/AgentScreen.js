import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { getDetailProduct, getKurir, getUser } from '../../api/functions';
import InputField from '../../component/InputField';
import RadioButtonGroup from '../../component/RadioButtonGroup';
import { auth } from '../../config/firebaseConfig';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const AgentScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorKtp, setNomorKtp] = useState('');
  const [alamat, setalamat] = useState('');
  const [kodereferal, setkodereferal] = useState('');
  const [ponsel, setponsel] = useState('');
  const [loading, setloading] = useState(false);

  const fetchUserData = async () => {
    getUser().then(userData => {
      if (userData) {
        setUser(userData)
      } else {
        console.log('No user data found');
      }
    })
  }

  const orderItem = async () => {
    setloading(true);
    const users = auth().currentUser;
    try {
      const orderRef = firestore().collection('users').doc(users.uid);
      await orderRef.update({
        namaKtp: namaLengkap,
        nomorNik: nomorKtp,
        alamat: alamat,
        phonenumber: ponsel,
        createdAt: new Date(),
        updatedAt: new Date(),
        needReview: true,
      });
      setloading(false);
      navigation.navigate('Home');
      Alert.alert('Pendaftaran Berhasil', 'Kami akan segera menghubungi anda untuk proses selanjutnya');
    } catch (error) {
      console.log(error);
      setloading(false);
      Alert.alert('Pendaftaran Gagal', 'Terjadi kesalahan saat melakukan pendaftaran');
    }
  }

  useState(() => {
    fetchUserData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1, paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20,paddingTop:50, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
          <Text style={styles.title}>Update Data untuk mendapatkan Kode Referal dapatkan cuan melimpah</Text>
          <Text style={styles.title}> </Text>
        </View>
        <View style={{ padding: 20 }} />
        <View style={{ padding: 20, width: width }}>
          <InputField
            label="Nama Lengkap (Sesuai KTP)"
            value={namaLengkap}
            onChangeText={setNamaLengkap}
            placeholder="Masukkan Nama Lengkap"
          />
          <InputField
            label="Nomor KTP"
            value={nomorKtp}
            onChangeText={setNomorKtp}
            placeholder="Masukkan Nomor KTP"
            keyboardType="numeric"
          />
          <InputField
            label="Alamat"
            value={alamat}
            onChangeText={setalamat}
            placeholder="Masukkan Alamat Anda"
            keyboardType="default"
          />
          <InputField
            label="Nomor Ponsel"
            value={ponsel}
            onChangeText={setponsel}
            placeholder="Masukkan Nomor Ponsel"
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.desc}>Catatan: Dengan menjadi Mitra, Anda dapat memperoleh komisi sebesar Rp 50.000 untuk setiap transaksi per gramnya.</Text>
        <Text style={styles.desc2}>Khusus untuk pembelian dinar, juga berlaku kelipatan.</Text>

        
        <TouchableOpacity
          style={styles.buttonConfirm}
          onPress={() => orderItem()}
        >
          <Text style={styles.textButton}>Daftar</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  desc: {
    padding:20,
    paddingBottom:0,
    fontSize: 12,
    textAlign: 'justify'
  },
  desc2: {
    padding: 20,
    paddingTop:0,
    fontSize: 12,
    textAlign: 'left',
    width:width,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  textButton: {
    color: 'white',
    fontWeight: 'normal',
    fontFamily: 'Montserrat-Medium'
  },
  image: {
    width: width / 2.5,
    height: 170,
    borderRadius: 10,
    margin: 10
  },
  buttonConfirm: {
    width: width - 40,
    height: 50,
    backgroundColor: '#214937',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20
  },
});

export default AgentScreen;
