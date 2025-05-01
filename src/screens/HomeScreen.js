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
    Linking,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrderKomisi, getrekening } from '../api/functions';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [refUsers, setRefUsers] = useState([]);
    const [product, setProduct] = useState([]);
    const [order, setOrder] = useState([]);
    const [rekening, setrekening] = useState(null);
    const [komisi, setKomisi] = useState(0);


    const [modalOrderVisible, setModalOrderVisible] = useState(false);
    const [newOrder, setNewOrder] = useState({
        harga: 0,
        hargaOngkir: 0,
        product: '',
        status: 0,
        pembeli: '',
        nik: '',
        address: '',
        kurir: '',
        phone: '',
    });


    const [modalVisible, setModalVisible] = useState(false);
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

    const fetchUserData = async () => {
        getrekening().then(userData => {
            if (userData) {
                setrekening(userData)
            } else {
                console.log('No user data found');
            }
        })
    }

    const fetchProduct = async () => {
        const uid = await AsyncStorage.getItem('uid');
        const snapshot = await firestore()
            .collection('product')
            .get();

        const others = [];
        snapshot.forEach(doc => {
            if (doc.id !== uid) {
                others.push({ id: doc.id, ...doc.data() });
            }
        });
        setProduct(others);
    };

    const fetchOrder = async () => {
        const uid = await AsyncStorage.getItem('uid');
        const snapshot = await firestore()
            .collection('order')
            .where('idUser', '==', uid)
            .get();

        const others = [];
        snapshot.forEach(doc => {
            if (doc.id !== uid) {
                others.push({ id: doc.id, ...doc.data() });
            }
        });
        setOrder(others);
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

    useEffect(() => {
        fetchData();
        fetchProduct();
        fetchOrder();
        fetchUserData();
        fetchKomisiData();
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

    const saveOrder = async () => {
        const { nama, nik, address, phone } = newOrder;
        if (!nama || !nik || !address || !phone) {
            return Alert.alert('Validasi Gagal', 'Semua field wajib diisi.');
        }

        setLoading(true);
        try {
            const uid = await AsyncStorage.getItem('uid');
            await firestore().collection('order').add({
                ...newOrder,
                status: 0,
                idUser: uid,
                parent: user.parent,
                header: user.header,
                isActive: true,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
            Alert.alert('Sukses', 'Pesanan berhasil dibuat.');
            setModalOrderVisible(false);
            setEditingUserId(null);
            fetchData();
            fetchOrder();
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

    const handleOrderDelete = (id) => {
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
                            await firestore().collection('order').doc(id).delete();
                            fetchData();
                            fetchOrder();
                            Alert.alert('Sukses', 'Pesanan berhasil dihapus.');
                        } catch (err) {
                            Alert.alert('Gagal', 'Gagal menghapus user.');
                        }
                    }
                }
            ]
        );
    };

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

    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('uid');
        } catch (error) {
            console.error("Sign out error: ", error);
        }
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
                            <Button title="Keluar" onPress={handleSignOut} color="#d9534f" />
                        </View>

                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceLabel}>Total Komisi</Text>
                            <Text style={styles.balanceValue}>Rp {komisi?.toLocaleString() || '0'}</Text>
                        </View>

                        <View style={{ marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>Order</Text>
                            <TouchableOpacity
                                style={styles.fab}
                                onPress={() => {
                                    setModalOrderVisible(true);
                                }}
                            >
                                <Text style={styles.fabText}>Tambah Pesanan</Text>
                            </TouchableOpacity>
                        </View>

                        {order.length === 0 ? (
                            <Text style={styles.empty}>Belum ada pesanan.</Text>
                        ) : (
                            order.map(u => (
                                <View key={u.id} style={styles.userCard}>
                                    <Text style={styles.userName}>{u.nama} ({u.phone})</Text>
                                    <Text style={styles.userPhone}>{u.address}</Text>
                                    <Text style={styles.userPhone}>Ongkir Rp {parseInt(u.hargaOngkir).toLocaleString('id')}</Text>
                                    <Text style={styles.userPhone}>Harga Rp {u?.harga?.toLocaleString('id')}</Text>
                                    {u.status === 0 &&
                                        <>
                                            <Text style={styles.userPhone}>Total Transfer Rp {(parseInt(u.hargaOngkir) + u?.harga).toLocaleString('id')}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Rekening</Text>
                                                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12 }}> {rekening.nama}</Text>
                                            </View><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}> </Text>
                                                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13 }}>Bank {rekening.bank} {rekening.nomor}</Text>
                                            </View></>
                                    }
                                    {u.status === 0 && <Text style={styles.userPhone}>Menunggu Konfirmasi</Text>}
                                    {u.status === 1 && <Text style={styles.userPhone}>Pesanan Diterima</Text>}
                                    {u.status === 2 && <Text style={styles.userPhone}>Pesanan Dikirim</Text>}
                                    {u.status === 3 && <Text style={styles.userPhone}>Pesanan Selesai</Text>}
                                    {u.status === 4 && <Text style={styles.userPhone}>Pesanan Dibatalkan</Text>}
                                    {u.status === 5 && <Text style={styles.userPhone}>Pesanan Ditolak</Text>}
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => openWhatsApp()} style={[styles.actionButton, { backgroundColor: 'green' }]}>
                                            <Text style={styles.actionText}>Chat Admin</Text>
                                        </TouchableOpacity>
                                        {u.status === 0 &&
                                            <TouchableOpacity onPress={() => handleOrderDelete(u.id)} style={[styles.actionButton, { backgroundColor: '#dc3545' }]}>
                                                <Text style={styles.actionText}>Hapus</Text>
                                            </TouchableOpacity>
                                        }
                                        {u.status >= 4 &&
                                            <TouchableOpacity onPress={() => handleOrderDelete(u.id)} style={[styles.actionButton, { backgroundColor: '#dc3545' }]}>
                                                <Text style={styles.actionText}>Hapus</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            ))
                        )}
                        <View style={{ margin: 10 }}></View>

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
                                    <Text style={styles.userPhone}>Komisi Rp {u?.saldo?.toLocaleString('id')}</Text>

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

            <Modal visible={modalVisible} animationType="slide" transparent>
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

            <Modal visible={modalOrderVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Pesanan Baru
                        </Text>

                        <TextInput
                            placeholder="Nama"
                            style={styles.input}
                            value={newOrder.nama}
                            onChangeText={(val) => setNewOrder({ ...newOrder, nama: val })}
                        />
                        <TextInput
                            placeholder="NIK"
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={newOrder.nik}
                            onChangeText={(val) => setNewOrder({ ...newUser, nik: val })}
                        />
                        <TextInput
                            placeholder="Alamat"
                            style={styles.input}
                            value={newOrder.address}
                            onChangeText={(val) => setNewOrder({ ...newOrder, address: val })}
                        />
                        <TextInput
                            placeholder="Nomor HP"
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={newOrder.phone}
                            onChangeText={(val) => setNewOrder({ ...newOrder, phone: val })}
                        />
                        <TextInput
                            placeholder="Ongkos Kirim"
                            style={styles.input}
                            keyboardType="number-pad"
                            value={newOrder.hargaOngkir}
                            onChangeText={(val) => setNewOrder({ ...newOrder, hargaOngkir: val })}
                        />

                        <View style={styles.dropdown}>
                            <FlatList
                                data={product}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setNewOrder({ ...newOrder, product: item.nama, harga: item.harga })}
                                        style={[
                                            styles.roleItem,
                                            newOrder.product === item.nama && styles.selectedRole,
                                        ]}
                                    >
                                        <Text>{item.nama}</Text>
                                        <Text>Rp {item?.harga?.toLocaleString('id')}</Text>

                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <View style={{ marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>Total Harga</Text>
                            <Text style={styles.sectionTitle}>{(parseInt(newOrder.hargaOngkir) + parseInt(newOrder.harga)).toLocaleString('id')}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={saveOrder}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.submitText}>
                                    {editingUserId ? 'Perbarui' : 'Pesan'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalOrderVisible(false)} style={{ marginTop: 10 }}>
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
});

export default HomeScreen;
