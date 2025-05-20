/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
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
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const AkunScreen = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const uid = await AsyncStorage.getItem('uid');
      if (!uid) return;
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        const userData = doc.data();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('uid');
      Alert.alert('Logged Out', 'You have been logged out.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const profile = {
    name: user?.name || 'Hilmanzu',
    phone: user?.phone || '0812-3456-7890',
    photo:
      user?.photo ||
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkAJEkJQ1WumU0hXNpXdgBt9NUKc0QDVIiaw&s',
  };

  const menuItems = [
    {
      label: 'FAQ',
      icon: 'help-circle-outline',
      url: 'https://abigold.co.id/faq',
    },
    {
      label: 'Garansi',
      icon: 'shield-check-outline',
      url: 'https://abigold.co.id/garansi',
    },
    {
      label: 'Pengembalian & Buyback',
      icon: 'cash-refund',
      url: 'https://abigold.co.id/refund_returns',
    },
    {
      label: 'Kebijakan Privasi',
      icon: 'shield-lock-outline',
      url: 'https://abigold.co.id/privacy-policy',
    },
  ];

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', onPress: () => signOut() },
    ]);
  };

  const handleOpenLink = async (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

        {/* PROFIL */}
        <View style={styles.profileContainer}>
          {/* <Image source={{ uri: profile.photo }} style={styles.profilePhoto} /> */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profilePhone}>{profile.phone}</Text>
          </View>
          {/* <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="pencil-outline" size={24} color="#214937" />
          </TouchableOpacity> */}
        </View>

        {/* LIST MENU */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleOpenLink(item.url)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={item.icon} size={24} color="#214937" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>
        ))}

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.appVersion}>Versi Aplikasi v1.0.0</Text>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        {/* Modal edit profil - belum diimplementasikan */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text>Edit Profil</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, color: 'blue' }}>Tutup</Text>
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 12,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#214937',
  },
  profilePhone: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#214937',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#214937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  appVersion: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 20,
  },
});

export default AkunScreen;
