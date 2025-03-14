import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { getDetailProduct } from '../../api/functions';

const { width } = Dimensions.get('window');

const DetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [user, setUser] = useState(null);

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

  useState(() => {
    fetchUserData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#214937" barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <Image source={{ uri: user.image3 }} style={{ width: width, height: width/2 }} />
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>{user.nama} ( {user.berat} )</Text>
          <View style={{ flexDirection: 'row' }}>
            <Image source={{ uri: user.image1 }} style={styles.image} />
            <Image source={{ uri: user.image2 }} style={styles.image} />
          </View>
          <Text style={styles.desc}>{user.desc1}</Text>
          <Text style={styles.title}>{formatHarga(user.harga)}</Text>
        </View>
        <View style={{alignItems:'center'}}>
          <TouchableOpacity
            style={styles.buttonConfirm}
            onPress={() => navigation.navigate("OrderCheckOutScreen", {
              id: id,
            })}
          >
            <Text style={styles.textButton}>Pesan Sekarang</Text>
          </TouchableOpacity>
        </View>
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
    marginVertical: 10,
    textAlign: 'center'
  },
  desc: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'justify',
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

export default DetailScreen;
