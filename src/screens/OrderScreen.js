import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { deleteKomisi, deleteOrder, getDetailProduct, getDriver, getOrder, getrekening } from '../api/functions';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const AccountScreen = () => {

  const [order, setorder] = useState([]);
  const [rekening, setrekening] = useState(null);


  const fetchOrderData = async () => {
    try {
      getOrder().then(userData => {
        if (userData) {
          const sortedData = userData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          const sortedData1 = sortedData.sort((a, b) => {
            if (a.status === "pending") return -1; // "pending" harus berada di atas
            if (b.status === "pending") return 1;  // "pending" harus berada di atas
            if (a.status === "toKurir") return -1; // "pending" harus berada di atas
            if (b.status === "toKurir") return 1;  // "pending" harus berada di atas
            if (a.status === "onKurir") return -1; // "pending" harus berada di atas
            if (b.status === "onKurir") return 1;  // "pending" harus berada di atas
            return 0;  // Jika keduanya tidak memiliki status "pending", urutkan secara default
          });
          setorder(sortedData1);
        } else {
          console.log('No user data found');
        }
      })

    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  const fetchUserData = async () => {
    getrekening().then(userData => {
      console.log(userData)
      if (userData) {
        setrekening(userData)
      } else {
        console.log('No user data found');
      }
    })
  }

  const openWhatsApp = () => {
    const phoneNumber = '+6287825159746'; // Ganti dengan nomor tujuan WhatsApp
    const message = 'Halo, saya ingin bertanya'; // Pesan yang ingin dikirim

    // Membuka WhatsApp berdasarkan platform
    let url = `https://wa.me/${phoneNumber}?text=${message}`;
    if (Platform.OS === 'ios') {
      url = `https://wa.me/${phoneNumber}?text=${message}`; // Untuk iOS
    }

    Linking.openURL(url).catch((err) => console.error('Tidak dapat membuka WhatsApp', err));
  };


  useEffect(() => {
    fetchOrderData();
    fetchUserData();
    const intervalId = setInterval(() => {
      fetchOrderData();
    }, 5000);
    return () => clearInterval(intervalId);
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
        <Text style={styles.title}>Order</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white' }}>
          <Text style={{ fontFamily: 'Montserrat-Regular' }}>Anda Belum Punya Orderan</Text>
        </View>
      </View>
    );
  }

  if (rekening === null) {
    return (
      <View style={styles.containerLoading}>
        <Text style={styles.title}>Order</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white' }}>
          <Text style={{ fontFamily: 'Montserrat-Regular' }}>Memuat Data</Text>
        </View>
      </View>
    );
  }

  const deleteItem = (id, invoice) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah kamu yakin ingin menghapus item ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              await deleteOrder(id)
              await deleteKomisi(invoice)
              fetchOrderData();
            } catch (error) {
              console.error('Gagal menghapus item:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          data={order}
          keyExtractor={(item) => item.id}
          vertical
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={[{ marginBottom: index === order.length - 1 ? 20 : 0 }, styles.itemCard]}>
              {item.status !== "pending" &&
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Invoice</Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, textAlign:'right'}}>{item.noInvoice}</Text>
                </View>
              }
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Status</Text>
                <Text style={{ fontWeight:'bold',fontFamily: 'Montserrat-Regular', fontSize: 13, color: statusColorText[item.status] || "black" }}>{statusText[item.status] || ""}</Text>
              </View>
              <View style={{ margin: 5 }}></View>
              {item.status === "pending" &&
                <><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Rekening</Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}> {rekening.nama}</Text>
                </View><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}> </Text>
                    <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Bank {rekening.bank} {rekening.nomor}</Text>
                  </View></>
              }
              {item.status !== "pending" &&
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Barang</Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, textAlign:'left', width:'100%' }}> : {item.namaProduct}</Text>
                </View>
              }
              {item.status !== "pending" &&
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Alamat</Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, textAlign:'left', width:'100%' }}> : {item.alamat}</Text>
                </View>
              }
              <View style={{ height: 1, backgroundColor: 'grey', marginVertical: 5 }}></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Kurir</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>{item.kurir}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Harga Pembelian</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Rp {item.biayaDonasi.toLocaleString("id-ID")}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Total Pembayaran</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Rp {(item.biayaKurir + item.angkaRandom + item.biayaDonasi).toLocaleString("id-ID")}</Text>
              </View>
              <View style={{ margin: 5 }}></View>
              <View style={{ margin: 5 }}></View>
              {item.status === "pending" &&
                <TouchableOpacity onPress={()=> deleteItem(item.id, item.noInvoice)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, color:'red' }}>Hapus</Text>
                </TouchableOpacity>
              }
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.floatingButton} onPress={openWhatsApp}>
        <Text style={styles.buttonText}>Chat Admin</Text>
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
    paddingTop:50,
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

export default AccountScreen;
