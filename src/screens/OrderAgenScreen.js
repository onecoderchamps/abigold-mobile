import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Linking } from 'react-native';
import { getDetailProduct, getDriver, getMember, getOrder, getrekening } from '../api/functions';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const AccountAgentScreen = ({navigation}) => {

  const [order, setorder] = useState([]);
  const [rekening, setrekening] = useState(null);


  const fetchOrderData = async () => {
    try {
      getMember().then(userData => {
        if (userData) {
          const sortedData = userData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setorder(sortedData);
        } else {
          console.log('No user data found');
        }
      })

    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  const openWhatsApp = () => {
    navigation.navigate("MemberAgent")
    console.log("il")
  };


  useEffect(() => {
    fetchOrderData();
  }, []);

  const statusText = {
    pending: "Menunggu Pembayaran",
    toKurir: "Request Pickup",
    onKurir: "Dalam Perjalanan",
    selesai: "Transaksi Selesai",
    cancel: "Pembatalan Sistem"
  };

  const statusColorText = {
    pending: "red",
    toKurir: "green",
    onKurir: "green",
    selesai: "blue",
    cancel: "red"
  };

  if (order.length === 0) {
    return (
      <View style={styles.containerLoading}>
        <Text style={styles.title}>Member</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white' }}>
          <Text style={{ fontFamily: 'Montserrat-Regular' }}>Anda Belum Punya Member</Text>
        </View>
        <TouchableOpacity style={styles.floatingButton} onPress={openWhatsApp}>
          <Text style={styles.buttonText}>Tambah Member</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          data={order}
          keyExtractor={(item) => item.id}
          vertical
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={[{ marginBottom: index === order.length - 1 ? 20 : 0 }, styles.itemCard]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Nama</Text>
                <Text style={{ fontWeight: 'bold', fontFamily: 'Montserrat-Regular', fontSize: 13, color: statusColorText[item.status] || "black" }}>{item.namaLengkap}</Text>
              </View>
              <View style={{ margin: 5 }}></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Nomor Ponsel</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}> {item.ponsel}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'grey', marginVertical: 5 }}></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Total Penjualan</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>{item.komisi.toLocaleString("id-ID")}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Komisi</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>{item.komisi.toLocaleString("id-ID")}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Saldo</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>{item.komisi.toLocaleString("id-ID")}</Text>
              </View>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.floatingButton} onPress={openWhatsApp}>
        <Text style={styles.buttonText}>Tambah Member</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLoading: {
    flex: 1,
  },
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
    paddingTop: 50,
    padding: 20,
    fontFamily: 'Montserrat-Regular'
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular'
  },
  textSub: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular'
  },
  textSub2: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    fontWeight: 'bold'
  },
  textNormal: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  itemCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#214937' },
  image: {
    width: 80, height: 80, borderRadius: 50
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#25D366', // Warna hijau WhatsApp
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountAgentScreen;
