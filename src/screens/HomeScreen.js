/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    FlatList,
    Button,
    Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrderKomisi, getrekening } from '../api/functions';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [refUsers, setRefUsers] = useState([]);
    const [komisi, setKomisi] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingwithdraw, setloadingwithdraw] = useState(false);
    const [productItems, setProductItems] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        roles: '',
        address: '',
        phone: '',
        komisi: 0,
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
      const [rekening, setrekening] = useState(null);
    

    const fetchUserData = async () => {
        const data = await getrekening();
        if (data) {
          setrekening(data);
        }
      };

    const fetchData = async () => {
        const uid = await AsyncStorage.getItem('uid');
        if (!uid) return;

        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
            const userData = doc.data();
            setUser(userData);

            const snapshot = await firestore()
                .collection('users')
                .where('parent', '==', uid)
                .get();

            const others = [];
            snapshot.forEach(doc => {
                if (doc.id !== uid) {
                    others.push({ id: doc.id, ...doc.data() });
                }
            });

            const updatedData = await Promise.all(
                others.map(async (data) => {
                    const userData = await getOrderKomisi({ uid: data.id });
                    const totalBiaya = userData.reduce((total, current) => total + Number(current.biayaKomisi || 0), 0);
                    const saldo = totalBiaya;
                    return {
                        ...data,
                        saldo, // tambahkan properti komisi ke data
                    };
                })
            );
            setRefUsers(updatedData);
        }

        const rolesSnap = await firestore().collection('roles').get();
        const parsedRoles = rolesSnap.docs
            .filter(doc => doc.data().key !== 'Agent')
            .map(doc => ({
                key: doc.data().key,
                label: doc.data().key,
                value: doc.data().value,
            }));
        setRoles(parsedRoles);
    };

    const fetchKomisiData = async () => {
        try {
            const uid = await AsyncStorage.getItem('uid');
            const userData = await getOrderKomisi({ uid: uid });
            if (userData && Array.isArray(userData)) {
                const totalBiaya = userData.reduce((total, current) => total + Number(current.biayaKomisi || 0), 0);
                setKomisi(totalBiaya);
                return totalBiaya;
            } else {
                console.log('No user data found');
                return 0;
            }
        } catch (error) {
            console.error('Error fetching komisi data:', error);
            return 0;
        }
    };

    const fetchProduct = async () => {
        const snapshot = await firestore().collection('product').get();
        const products = [];
        snapshot.forEach(doc => {
            products.push({ label: doc.data().nama, value: doc.data().nama, harga: doc.data().harga, desc2: doc.data().desc2 });
        });
        setProductItems(products);
    };


    useEffect(() => {
        fetchUserData();
        fetchData();
        fetchKomisiData();
        fetchProduct();
    }, []);

    const formatPhone = (number) => {
        const cleaned = number.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
        if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
        if (cleaned.startsWith('8')) return '+62' + cleaned;
        if (cleaned.startsWith('628')) return '+' + cleaned;
        if (cleaned.startsWith('+628')) return cleaned;
        return '+62' + cleaned;
    };

    const saveUser = async () => {
        const { name, roles, address, phone, komisi } = newUser;
        if (!name || !roles || !address || !phone || !komisi) {
            return Alert.alert('Validasi Gagal', 'Semua field wajib diisi.');
        }

        const formattedPhone = formatPhone(phone);
        setLoading(true);

        try {
            const uid = await AsyncStorage.getItem('uid');

            // Cek apakah nomor sudah terdaftar
            const phoneQuery = await firestore()
                .collection('users')
                .where('phone', '==', formattedPhone)
                .get();

            const phoneExists = phoneQuery.docs.some(doc => doc.id !== editingUserId);

            if (phoneExists) {
                setLoading(false);
                return Alert.alert('Validasi Gagal', 'Nomor sudah terdaftar.');
            }

            const userData = {
                name,
                roles,
                address,
                phone: formattedPhone,
                komisi,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            };

            if (editingUserId) {
                await firestore().collection('users').doc(editingUserId).update(userData);
                Alert.alert('Sukses', 'User berhasil diperbarui.');
            } else {
                await firestore().collection('users').add({
                    ...userData,
                    parent: uid,
                    header: user.header,
                    balance: 0,
                    referal: Math.floor(10000 + Math.random() * 90000).toString(),
                    isActive: false,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
                Alert.alert('Sukses', 'User berhasil dibuat.');
            }

            setModalVisible(false);
            setNewUser({ name: '', roles: '', address: '', phone: '', komisi: 0 });
            setEditingUserId(null);
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (user) => {
        setNewUser({
            name: user.name,
            roles: user.roles,
            address: user.address,
            phone: user.phone,
            komisi: user.komisi,
        });
        setEditingUserId(user.id);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus user ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await firestore().collection('users').doc(id).delete();
                            fetchData();
                            Alert.alert('Sukses', 'User berhasil dihapus.');
                        } catch (err) {
                            Alert.alert('Gagal', 'Gagal menghapus user.');
                        }
                    }
                }
            ]
        );
    };

    const handleWithdraw = () => {
        // Aksi saat tombol Withdraw ditekan
        // Misalnya, bisa tampilkan dialog konfirmasi atau lakukan proses penarikan.
        Alert.alert(
            'Konfirmasi Withdraw',
            'Apakah Anda yakin ingin menarik komisi Anda?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'default',
                    onPress: async () => {
                        setloadingwithdraw(true)
                        await fetch('https://app.saungwa.com/api/create-message', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: user.phone,
                              authkey: "Z8hxOuMsQapmnfe3GFkNbmgWMuOLLcVxnU1oO6fufLFKy0bpS4",
                              appkey: "165ba4e8-713c-40e2-92a5-3696ae54d45f",
                              message: `Hallo ${user.name}, untuk melakukan penarikan komisi, mohon lampirkan informasi dengan format wd:{nama akun}/{akun bank}/{nomor rekening} contoh wd:user/bca/123456`
                            }),
                          });
                        setloadingwithdraw(false)
                        Alert.alert("Pemberitahuan","Kami sudah mengirimkan permintaan Withdraw mohon menunggu admin menghubungi anda terimakasih")
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.backgroundStyle}>
            <StatusBar backgroundColor="#214937" barStyle="light-content" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                {user && (
                    <>
                        <View style={{ margin: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.welcome}>Hai, {user.roles}</Text>
                                <Text style={styles.welcome}>{user.name}</Text>
                            </View>
                        </View>

                        <View style={styles.balanceContainer}>
                            <View>
                                <Text style={styles.balanceLabel}>Total Komisi</Text>
                                <Text style={styles.balanceValue}>Rp {komisi?.toLocaleString() || '0'}</Text>
                            </View>

                            {/* Tambahkan tombol Withdraw */}
                            <TouchableOpacity
                                disabled={loadingwithdraw}
                                style={styles.withdrawButton}
                                onPress={() => handleWithdraw()}
                            >
                                <Text style={styles.withdrawText}>{loadingwithdraw ? "Proses" : "Withdraw"}</Text>
                            </TouchableOpacity>
                        </View>

                        {productItems.length > 0 && (
                            <View style={styles.goldContainer}>
                                <Text style={styles.sectionTitle}>Emas Terkini</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Product</Text>
                                    <Text style={styles.priceLabel}>Harga Beli</Text>
                                    <Text style={styles.priceLabel}>BuyBack</Text>
                                </View>
                                {productItems.map((productItem) => {
                                    const hargaBeli = Number(productItem.harga); // Asumsi produk memiliki field 'price' untuk harga beli
                                    const hargaJual = parseInt(productItem.harga - (hargaBeli * 5.5 / 100).toFixed(0)); // Kalkulasi harga jual 5.5%
                                    const nama = productItem.desc2;
                                    return (
                                        <View key={productItem.id} style={styles.priceRow}>
                                            <Text style={styles.priceValue}>{nama}</Text>
                                            <Text style={styles.priceValue}>Rp {hargaBeli.toLocaleString('id')}</Text>
                                            <Text style={styles.priceValue}>Rp {hargaJual.toLocaleString('id-ID')}</Text>
                                        </View>
                                    )
                                })}
                            </View>
                        )}


                        <View style={{ marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>Anggota Team</Text>
                            <TouchableOpacity
                                style={styles.fab}
                                onPress={() => {
                                    setNewUser({ name: '', roles: '', address: '', phone: '', komisi: 0 });
                                    setEditingUserId(null);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.fabText}>Tambah Member</Text>
                            </TouchableOpacity>
                        </View>

                        {refUsers.length === 0 ? (
                            <Text style={styles.empty}>Belum ada anggota.</Text>
                        ) : (
                            refUsers.map(u => (
                                <View key={u.id} style={styles.userCard}>
                                    <Text style={styles.userName}>{u.name} ({u.roles})</Text>
                                    <Text style={styles.userPhone}>{u.phone}</Text>
                                    <Text style={styles.userPhone}>Komisi {u.komisi}%</Text>
                                    <Text style={styles.userPhone}>Saldo Rp {u?.saldo?.toLocaleString('id')}</Text>

                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => handleEdit(u)} style={[styles.actionButton, { backgroundColor: '#ffc107' }]}>
                                            <Text style={styles.actionText}>Edit</Text>
                                        </TouchableOpacity>
                                        {/* <TouchableOpacity onPress={() => handleDelete(u.id)} style={[styles.actionButton, { backgroundColor: '#dc3545' }]}>
                                            <Text style={styles.actionText}>Hapus</Text>
                                        </TouchableOpacity> */}
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingUserId ? 'Edit User' : 'Tambah User Baru'}
                        </Text>

                        <TextInput
                            placeholder="Nama"
                            style={styles.input}
                            value={newUser.name}
                            onChangeText={(val) => setNewUser({ ...newUser, name: val })}
                        />
                        <TextInput
                            placeholder="Alamat"
                            style={styles.input}
                            value={newUser.address}
                            onChangeText={(val) => setNewUser({ ...newUser, address: val })}
                        />
                        <TextInput
                            placeholder="Nomor HP"
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={newUser.phone}
                            onChangeText={(val) => setNewUser({ ...newUser, phone: val })}
                        />

                        <View style={styles.dropdown}>
                            <FlatList
                                data={roles}
                                keyExtractor={item => item.key}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setNewUser({ ...newUser, roles: item.key, komisi: item.value })}
                                        style={[
                                            styles.roleItem,
                                            newUser.roles === item.key && styles.selectedRole,
                                        ]}
                                    >
                                        <Text>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={saveUser}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.submitText}>
                                    {editingUserId ? 'Perbarui' : 'Simpan'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                            <Text style={{ textAlign: 'center', color: '#214937' }}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backgroundStyle: {
        flex: 1,
        backgroundColor: '#fff',
    },
    welcome: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#214937',
    },
    balanceContainer: {
        backgroundColor: '#214937',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    balanceLabel: {
        color: '#fff',
        fontSize: 16,
    },
    balanceValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    userCard: {
        backgroundColor: '#f1f1f1',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    userPhone: {
        fontSize: 14,
        color: '#555',
    },
    empty: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    fab: {
        backgroundColor: '#214937',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    dropdown: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 10,
        padding: 5,
    },
    roleItem: {
        padding: 10,
    },
    selectedRole: {
        backgroundColor: '#e0f7e9',
    },
    submitButton: {
        backgroundColor: '#214937',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    goldCard: {
        backgroundColor: '#fff9e6',
        borderWidth: 1,
        borderColor: '#f5c542',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    goldTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#214937',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    priceLabel: {
        fontSize: 14,
        color: '#333',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#214937',
    },
    goldContainer: {
        backgroundColor: '#fdf7e3',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    withdrawButton: {
        backgroundColor: '#f1c40f',
        borderRadius: 8,
        width:100,
        height:30,
        alignItems:'center',
        justifyContent:'center'
    },
    withdrawText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
