import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { getDetailProduct, getKurir, getMember } from '../../api/functions';
import InputField from '../../component/InputField';
import RadioButtonGroup from '../../component/RadioButtonGroup';
import { auth } from '../../config/firebaseConfig';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const OrderCheckOut = ({ route, navigation }) => {
  const { id } = route.params;
  const [user, setUser] = useState(null);
  const [kurir, setKurir] = useState([]);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorKtp, setNomorKtp] = useState('');
  const [alamat, setalamat] = useState('');
  const [kodereferal, setkodereferal] = useState('');
  const [donasi, setdonasi] = useState(0);

  const [ponsel, setponsel] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  const [member, setmember] = useState([]);

  const [loading, setloading] = useState(false);



  const formatHarga = (harga) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(harga);
  };

  const fetchUserData = async () => {
    getDetailProduct({ id }).then(userData => {
      if (userData) {
        setUser(userData)
      } else {
        console.log('No user data found');
      }
    })
  }

  const fetchKurirData = async () => {
    getKurir({ id }).then(userData => {
      if (userData) {
        setKurir(userData)
      } else {
        console.log('No user data found');
      }
    })
  }

  const fetchMemberData = async () => {
    getMember().then(userData => {
      if (userData) {
        console.log(userData)
        setmember(userData)
      } else {
        console.log('No user data found');
      }
    })
  }

  const generateInvoice = () => {
    const randomPart1 = Math.floor(Math.random() * 9000) + 1000; // 4 digit acak
    const randomPart2 = Math.floor(Math.random() * 9000) + 1000; // 4 digit acak
    const randomPart3 = Math.floor(Math.random() * 9000) + 1000; // 4 digit acak

    return `INV-${randomPart1}-${randomPart2}/${randomPart3}`;
  };

  const orderItem = async () => {
    setloading(true);
    const users = auth().currentUser;
    const invoice = generateInvoice();
    try {
      const orderRef = firestore().collection('order').doc();
      await orderRef.set({
        id: orderRef.id,
        idProduct: id,
        idUser: users.uid,
        idMember: selectedMember.id,
        namaProduct: user.nama + " " + user.berat,
        namaLengkap: namaLengkap,
        nomorKtp: nomorKtp,
        alamat: alamat,
        ponsel: ponsel,
        kurir: selectedCarrier.value,
        codeReferal: kodereferal,
        noInvoice: invoice,
        status: 'pending',
        statusKurir: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        angkaRandom: Math.floor(Math.random() * 900) + 100,
        biayaKurir: selectedCarrier.price,
        biayaKomisi: Math.round((Number(donasi - user.harga) * Number(100 - selectedMember.komisi) / 100) - (Number(selectedMember.komisi) / 100)),
        biayaKomisiSub: Math.round(Number(donasi - user.harga) * Number(selectedMember.komisi) / 100 - Number(selectedMember.komisi) / 100),
        biayaDonasi: Number(donasi),
        isPayedKomisi: false,
        isPayedDonasi: false,
        price: user.harga,
        isActice: true,
        isPayed: false,
      });
      const komisiRef = firestore().collection('komisi').doc();
      await komisiRef.set({
        id: komisiRef.id,
        noInvoice: invoice,
        idProduct: id,
        idUser: users.uid,
        biayaKomisi: Math.round(Number(donasi - user.harga) * Number(100 - selectedMember.komisi) / 100 - Number(selectedMember.komisi) / 100),
        createdAt: new Date(),
        updatedAt: new Date(),
        isPayedKomisi: false,
      })
      const komisi2Ref = firestore().collection('komisi').doc();
      await komisi2Ref.set({
        id: komisi2Ref.id,
        noInvoice: invoice,
        idProduct: id,
        idUser: selectedMember.id,
        biayaKomisi: Math.round(Number(donasi - user.harga) * Number(selectedMember.komisi) / 100 - Number(selectedMember.komisi) / 100),
        createdAt: new Date(),
        updatedAt: new Date(),
        isPayedKomisi: false,
      })
      setloading(false);
      navigation.navigate('Home');
      Alert.alert('Pembelian Berhasil', 'Silahkan cek status pembelian di menu Aktifitas Pembelian');
    } catch (error) {
      console.log(error);
      setloading(false);
      Alert.alert('Pembelian Gagal', 'Terjadi kesalahan saat melakukan pembelian');
    }
  }

  useState(() => {
    fetchUserData();
    fetchKurirData();
    fetchMemberData();
  }, []);


  const handleCarrierSelect = (value) => {
    setSelectedCarrier(value);
  };

  const handleMemberSelect = (value) => {
    setSelectedMember(value);
  };

  const handleSubmit = () => {
    Alert.alert('Pengiriman Dipilih', `Anda memilih: ${selectedCarrier}`);
  };

  const carrierOptions = [
    { label: 'Paxel (Khusus Jabodetabek)', value: 'paxel', price: 20000 },
    { label: 'JNE (Khusus Antar Kota)', value: 'jne', price: 35000 },
    { label: 'Tiki (Khusus Antar Provinsi)', value: 'tiki', price: 35000 },
  ];

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1, paddingBottom: 40 }}>

        <Image source={{ uri: user.image3 }} style={{ width: width, height: width / 2 }} />
        <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
          <Text style={styles.title}>{user.nama} ( {user.berat} )</Text>
          <Text style={styles.title}>{formatHarga(user.harga)}</Text>
        </View>
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
            label="Alamat Tujuan"
            value={alamat}
            onChangeText={setalamat}
            placeholder="Masukkan Alamat Tujuan"
            keyboardType="default"
          />
          <InputField
            label="Nomor Ponsel"
            value={ponsel}
            onChangeText={setponsel}
            placeholder="Masukkan Nomor Ponsel"
            keyboardType="numeric"
          />
          <Text style={styles.desc}>Jasa Pengiriman</Text>
          <RadioButtonGroup
            options={kurir}
            selectedValue={selectedCarrier.value}
            onSelect={handleCarrierSelect}
          />
          <View style={{ margin: 10 }} />
          <Text style={styles.desc}>Penjual</Text>
          <RadioButtonGroup
            options={member}
            selectedValue={selectedMember.value}
            onSelect={handleMemberSelect}
          />
          <View style={{ margin: 10 }} />
          {/* <InputField
            label="Kode Referal"
            value={kodereferal}
            onChangeText={setkodereferal}
            placeholder="Masukkan Kode"
          /> */}
          <InputField
            label="Harga Jual"
            value={donasi}
            onChangeText={setdonasi}
            placeholder="Masukkan Harga Jual"
            keyboardType="numeric"
          />
        </View>

        {selectedCarrier && (
          <>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
              <Text style={styles.desc}>Komisi</Text>
              <Text style={styles.desc}>{formatHarga(Number(donasi - user.harga) * Number(100-selectedMember.komisi) / 100 - Number(selectedMember.komisi) / 100)}</Text>
            </View>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
              <Text style={styles.desc}>Komisi Member</Text>
              <Text style={styles.desc}>{formatHarga(Number(donasi - user.harga) * Number(selectedMember.komisi) / 100 - Number(selectedMember.komisi) / 100)}</Text>
            </View>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
              <Text style={styles.desc}>Biaya Pengiriman</Text>
              <Text style={styles.desc}>{formatHarga(selectedCarrier.price)}</Text>
            </View><View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
              <Text style={styles.desc}>{user.nama} ( {user.berat} )</Text>
              <Text style={styles.desc}>{formatHarga(user.harga)}</Text>
            </View><View style={{ paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', width: width }}>
              <Text style={styles.title}>Total Pembelian</Text>
              <Text style={styles.title}>{formatHarga(selectedCarrier.price + Number(donasi))}</Text>
            </View><TouchableOpacity
              style={styles.buttonConfirm}
              onPress={() => orderItem()}
            >
              <Text style={styles.textButton}>Konfirmasi</Text>
            </TouchableOpacity></>
        )}
        <View style={{ height: 50 }} />
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
    fontSize: 16,
    textAlign: 'justify'
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

export default OrderCheckOut;
