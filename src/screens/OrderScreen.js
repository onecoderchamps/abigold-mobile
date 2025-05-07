import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  FlatList, Dimensions, Alert, ActivityIndicator, StatusBar, Linking
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getrekening } from '../api/functions';

const { width } = Dimensions.get('window');

const AccountScreen = () => {
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState([]);
  const [rekening, setrekening] = useState(null);
  const [modalOrderVisible, setModalOrderVisible] = useState(false);
  const [openKurir, setOpenKurir] = useState(false);
  const [kurirChoice, setKurirChoice] = useState([]);
  const [openProduct, setOpenProduct] = useState(false);
  const [productItems, setProductItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newOrder, setNewOrder] = useState({
    nama: '',
    nik: '',
    address: '',
    phone: '',
    harga: 0,
    product: '',
    status: 0,
    kurir: '',
    kurirLabel: '',
    hargaOngkir: 0,
    jumlah: 1,
    asuransi: 0,
  });
  const [fieldError, setFieldError] = useState({});

  const fetchData = async () => {
    const uid = await AsyncStorage.getItem('uid');
    if (!uid) return;

    const doc = await firestore().collection('users').doc(uid).get();
    if (doc.exists) {
        const userData = doc.data();
        setUser(userData);
    }
};

  const fetchKurir = async () => {
    const uid = await AsyncStorage.getItem('uid');
    const snapshot = await firestore()
      .collection('kurir')
      .get();

    const others = [];
    snapshot.forEach(doc => {
      if (doc.id !== uid) {
        others.push({ id: doc.id, ...doc.data() });
      }
    });
    setKurirChoice(others);
  };

  const fetchProduct = async () => {
    const snapshot = await firestore().collection('product').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ label: doc.data().nama, value: doc.data().nama, harga: doc.data().harga });
    });
    setProductItems(products);
  };

  const fetchOrderData = async () => {
    const uid = await AsyncStorage.getItem('uid');
    const snapshot = await firestore()
      .collection('order')
      .where('idUser', '==', uid)
      .get();
  
    const userOrders = [];
    snapshot.forEach(doc => {
      userOrders.push({ id: doc.id, ...doc.data() });
    });
  
    // Urutkan secara manual berdasarkan createdAt (terbaru di atas)
    userOrders.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() ?? new Date(0);
      const timeB = b.createdAt?.toDate?.() ?? new Date(0);
      return timeB - timeA;
    });
  
    setOrder(userOrders);
  };
  
  

  const fetchUserData = async () => {
    const data = await getrekening();
    if (data) {
      setrekening(data);
    }
  };

  const saveOrder = async () => {
    const { nama, nik, address, phone, product, kurir } = newOrder;
    const errors = {};

    if (!nama) errors.nama = true;
    if (!nik) errors.nik = true;
    if (!address) errors.address = true;
    if (!phone) errors.phone = true;
    if (!product) errors.product = true;
    if (!kurir) errors.kurir = true;

    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      Alert.alert('Validasi Gagal', 'Semua field wajib diisi dan dipilih.');
      return;
    }

    setFieldError({});
    setLoading(true);
    try {
      const uid = await AsyncStorage.getItem('uid');
      await firestore().collection('order').add({
        ...newOrder,
        harga: parseInt(newOrder.jumlah * newOrder.harga),
        header: user.header,
        parent: user.parent,
        status: 0,
        idUser: uid,
        isActive: true,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Sukses', 'Pesanan berhasil dibuat.');
      setModalOrderVisible(false);user
      setNewOrder({
        nama: '',
        nik: '',
        address: '',
        phone: '',
        harga: 0,
        product: '',
        status: 0,
        kurir: '',
        kurirLabel: '',
        hargaOngkir: 0,
        jumlah: 1,
        asuransi: 0,
      });
      fetchOrderData();
    } catch (err) {
      console.error('Error saving order:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setLoading(false);
    }
  };


  const openWhatsApp = () => {
    const phoneNumber = '6287825159746';
    const message = 'Halo, saya ingin konfirmasi pembayaran';
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    Alert.alert(
      'Perhatian',
      'Mohon lampirkan bukti pengiriman kepada admin ABI, pastikan bukti pengiriman sudah tersedia',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan', style: 'destructive',
          onPress: async () => {
            try {
              Linking.openURL(url).catch(err => console.error('Tidak dapat membuka WhatsApp', err));
            } catch (err) {
              Alert.alert('Gagal', 'Gagal menghapus pesanan.');
            }
          }
        }
      ]
    );
  };

  const handleOrderDelete = async (id) => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus pesanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('order').doc(id).delete();
              fetchOrderData();
              Alert.alert('Sukses', 'Pesanan berhasil dihapus.');
            } catch (err) {
              Alert.alert('Gagal', 'Gagal menghapus pesanan.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchOrderData();
    fetchUserData();
    fetchProduct();
    fetchKurir();
    fetchData();
    const intervalId = setInterval(() => {
      fetchOrderData();
      fetchProduct();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.backgroundStyle}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <Text style={styles.title}>Pesanan</Text>
      <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 5, right: 15, zIndex: 10000 }}>
        <TouchableOpacity style={styles.fab} onPress={() => setModalOrderVisible(true)}>
          <Text style={styles.fabText}>Tambah Pesanan</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

        {order.length === 0 ? (
          <Text style={styles.empty}>Belum ada pesanan.</Text>
        ) : (
          order.map(u => (
            <View key={u.id} style={styles.userCard}>
              <Text style={styles.userName}>{u.nama} ({u.phone})</Text>
              <Text style={styles.userPhone}>{u.address}</Text>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10}}>
                <Text style={styles.userPhone}>Jasa Kurir</Text>
                <Text style={styles.userPhone}>{u.kurirLabel}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.userPhone}>Ongkir</Text>
                <Text style={styles.userPhone}>Rp {parseInt(u.hargaOngkir).toLocaleString('id')}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.userPhone}>Asuransi</Text>
                <Text style={styles.userPhone}>Rp {parseInt(u.asuransi).toLocaleString('id')}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.userPhone}>Harga Produk</Text>
                <Text style={styles.userPhone}>Rp {parseInt(u.harga / u.jumlah).toLocaleString('id') + " x " + parseInt(u.jumlah).toLocaleString('id')}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.userPhone}>Total Transfer</Text>
                <Text style={styles.userPhone}>Rp {(parseInt(u.harga + parseInt(u.hargaOngkir) + parseInt(u.asuransi))).toLocaleString('id')}</Text>
              </View>

              {u.status === 0 && (
                <View style={{ margin: 10 }}>
                  <Text style={styles.userPhone}>Transfer Tujuan</Text>
                  <Text style={styles.userPhone}>Bank {rekening?.bank} - {rekening?.nomor} a/n {rekening?.nama}</Text>
                </View>
              )}

              {u.status === 1 && <Text style={styles.userPhone2}>Proses Packing</Text>}
              {u.status === 2 && <Text style={styles.userPhone2}>Pesanan Dikirim</Text>}
              {u.status === 3 && <Text style={styles.userPhone2}>Pesanan Selesai</Text>}
              {u.status === 4 && <Text style={styles.userPhone2}>Pesanan Dibatalkan</Text>}
              {u.status === 5 && <Text style={styles.userPhone2}>Pesanan Ditolak</Text>}

              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]} onPress={openWhatsApp}>
                  <Text style={styles.actionText}>Chat Admin</Text>
                </TouchableOpacity>
                {(u.status === 0 || u.status >= 4) && (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dc3545' }]} onPress={() => handleOrderDelete(u.id)}>
                    <Text style={styles.actionText}>Hapus</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOrderVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pesanan Baru</Text>
            <TextInput placeholder="Nama" style={[styles.input, fieldError.nama && styles.inputError]} value={newOrder.nama} onChangeText={val => setNewOrder({ ...newOrder, nama: val })} />
            <TextInput placeholder="NIK" style={[styles.input, fieldError.nama && styles.inputError]} keyboardType="number-pad" value={newOrder.nik} onChangeText={val => setNewOrder({ ...newOrder, nik: val })} />
            <TextInput placeholder="Alamat" style={[styles.input, fieldError.nama && styles.inputError]} value={newOrder.address} onChangeText={val => setNewOrder({ ...newOrder, address: val })} />
            <TextInput placeholder="Nomor HP" style={[styles.input, fieldError.nama && styles.inputError]} keyboardType="phone-pad" value={newOrder.phone} onChangeText={val => setNewOrder({ ...newOrder, phone: val })} />

            <DropDownPicker
              open={openKurir}
              value={newOrder.kurir}
              items={kurirChoice}
              style={[styles.dropdown, fieldError.kurir && styles.inputError]}
              setOpen={setOpenKurir}
              setValue={val => {
                const selected = kurirChoice.find(k => k.value === val());
                if (selected) {
                  setNewOrder(prev => ({
                    ...prev,
                    kurir: selected.value,
                    kurirLabel: selected.label,
                    hargaOngkir: selected.price,
                    hargaOngkir: selected.price,
                    asuransi: selected.asuransi
                  }));
                }
              }}
              setItems={setKurirChoice}
              placeholder="Pilih Kurir"
              dropDownContainerStyle={{ zIndex: 10000 }}
            />

            <DropDownPicker
              open={openProduct}
              value={newOrder.product}
              items={productItems}
              setOpen={setOpenProduct}
              setValue={val => {
                const selected = productItems.find(p => p.value === val());
                if (selected) {
                  setNewOrder(prev => ({
                    ...prev,
                    product: selected.value,
                    harga: selected.harga
                  }));
                }
              }}
              setItems={setProductItems}
              placeholder="Pilih Produk"
              style={[styles.dropdown, fieldError.product && styles.inputError]}
              dropDownContainerStyle={{ zIndex: 999 }}
            />

            <View style={[styles.counterContainer, fieldError.jumlah && styles.inputError]}>
              <TouchableOpacity
                onPress={() =>
                  setNewOrder(prev => ({
                    ...prev,
                    jumlah: Math.max(1, prev.jumlah - 1),
                  }))
                }
                style={styles.counterButton}
              >
                <Text style={styles.counterText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.counterValue}>{newOrder.jumlah}</Text>

              <TouchableOpacity
                onPress={() =>
                  setNewOrder(prev => ({
                    ...prev,
                    jumlah: prev.jumlah + 1,
                  }))
                }
                style={styles.counterButton}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{fontSize: 12, fontWeight: '600'}}>Harga</Text>
              <Text style={{fontSize: 12, fontWeight: '600'}}>
                Rp {(parseInt(newOrder.harga)).toLocaleString('id')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{fontSize: 12, fontWeight: '600'}}>Ongkir</Text>
              <Text style={{fontSize: 12, fontWeight: '600'}}>
                Rp {(parseInt(newOrder.hargaOngkir)).toLocaleString('id')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{fontSize: 12, fontWeight: '600'}}>Asuransi</Text>
              <Text style={{fontSize: 12, fontWeight: '600'}}>
                Rp {(parseInt(newOrder.asuransi)).toLocaleString('id')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Total Harga</Text>
              <Text style={styles.sectionTitle}>
                Rp {(parseInt(newOrder.harga * newOrder.jumlah) + parseInt(newOrder.hargaOngkir) + parseInt(newOrder.asuransi)).toLocaleString('id')}
              </Text>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={saveOrder} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Simpan</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalOrderVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: 'center', color: '#214937' }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout & Background
  backgroundStyle: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  // Titles & Text
  title: {
    width: width,
    paddingTop: 50,
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#214937',
    fontFamily: 'Montserrat-Regular',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#555',
  },
  userPhone2: {
    fontSize: 14,
    margin: 10
  },
  fabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  submitText: {
    fontWeight: 'bold',
    color: '#fff',
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    maxHeight: 150,
    padding: 5,
    marginBottom: 10,
  },

  // Cards & Buttons
  userCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#214937',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#214937',
    borderRadius: 10,
    padding: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#214937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});


export default AccountScreen;
