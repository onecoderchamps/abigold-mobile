/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Clipboard,
    Dimensions,
    FlatList,
    Image,
    Linking,
    PermissionsAndroid,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getBanner, getBannerNews, getOrderKomisi, getUser } from '../api/functions';
import LottieView from 'lottie-react-native';
import { auth } from '../config/firebaseConfig';

const { width } = Dimensions.get('window');
const items = [
    {
        name: 'TrasRide',
        image: <Image
            source={require('../asset/car.png')}  // Local image
            style={{ width: 40, height: 40 }}
        />,
        navigate: 'TrasRide',
        status: true
    },
    {
        name: 'TrasRent',
        image: <Image
            source={require('../asset/rent.png')}  // Local image
            style={{ width: 40, height: 40 }}
        />,
        navigate: 'TrasRent',
        status: false
    },
];

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Izin notifikasi diberikan:', authStatus);
    }
}

const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, // Notifikasi (Android 13+)
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, // Mikrofon
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Lokasi Akurat
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, // Lokasi Kasar
            ]);

            return {
                notifications: granted[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === PermissionsAndroid.RESULTS.GRANTED,
                microphone: granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED,
                fineLocation: granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED,
                coarseLocation: granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED,
            };
        } catch (err) {
            console.warn(err);
            return null;
        }
    }
    return {
        notifications: true,
        microphone: true,
        fineLocation: true,
        coarseLocation: true,
    };
};

const HomeScreen = ({ navigation }) => {

    const [user, setUser] = useState(null);
    const [banner, setBanner] = useState([]);
    const [bannerNews, setBannerNews] = useState([]);
    const [komisi, setKomisi] = useState(0);


    const fetchBannerData = async () => {
        await getBanner().then(bannerData => {
            if (bannerData) {
                setBanner(bannerData)
            } else {
                console.log('No user data found');
            }
        })
    }

    const fetchBannerNewsData = async () => {
        await getBannerNews().then(bannerData => {
            if (bannerData) {
                setBannerNews(bannerData)
            } else {
                console.log('No user data found');
            }
        })
    }

    const fetchKomisiData = async (codereferals) => {
        getOrderKomisi({ codereferals }).then(userData => {
            if (userData) {
                const totalBiaya = userData.reduce((total, current) => total + current.biayaKomisi, 0);
                setKomisi(totalBiaya)
            } else {
                console.log('No user data found');
            }
        })
    }

    useEffect(() => {
        requestUserPermission();
        requestPermissions();

        const fetchUserData = async () => {
            getUser().then(userData => {
                if (userData) {
                    setUser(userData)
                    fetchKomisiData(userData.codeReferal);
                    clearInterval(intervalId);
                } else {
                    console.log('No user data found');
                }
            })
        }
        fetchUserData();
        fetchBannerData();
        fetchBannerNewsData();

        // Dapatkan token perangkat untuk notifikasi
        messaging().getToken().then(token => console.log('FCM Token:', token));
        // Handle notifikasi ketika aplikasi berjalan
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            Alert.alert('Pesan Baru!', JSON.stringify(remoteMessage.notification));
        });

        const intervalId = setInterval(fetchUserData, 1000);
        return unsubscribe;
    }, []);

    const openWhatsApp = () => {
        const user = auth().currentUser;
        const phoneNumber = '+6287825159746'; // Ganti dengan nomor tujuan WhatsApp
        const message = 'Halo, saya ingin tarik dana dengan ID akun : ' + user.uid; // Pesan yang ingin dikirim

        // Membuka WhatsApp berdasarkan platform
        let url = `https://wa.me/${phoneNumber}?text=${message}`;
        if (Platform.OS === 'ios') {
            url = `https://wa.me/${phoneNumber}?text=${message}`; // Untuk iOS
        }

        Linking.openURL(url).catch((err) => console.error('Tidak dapat membuka WhatsApp', err));
    };

    if (!user) {
        return (
            <View style={styles.containerLoading}>
                <LottieView width={width - 200} height={width - 200} source={require('../asset/animation/search.json')} autoPlay loop />
                <Text style={{ fontFamily: 'Montserrat-Regular' }}>Sedang Memuat Data</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.backgroundStyle}>
            <StatusBar backgroundColor="#214937" barStyle="light-content" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}>
                <View style={styles.backgroundDesign} />
                <View style={{ margin: 20 }} />
                <Text style={styles.textHeader}>
                    Hi, {user.fullname}
                </Text>
                <Text style={[styles.textTitle, { color: '#fff' }]}>
                    Selamat datang di ABI
                </Text>
                <View style={{ margin: 15 }} />
                {user.isAgent &&
                    <View style={styles.barTopup}>
                        <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                source={require('../asset/wallet.png')}  // Local image
                                style={{ width: 30, height: 30 }}
                            />
                        </View>
                        <View style={{ width: 150, height: 50, justifyContent: 'center' }}>
                            <Text style={styles.textDesc}>Komisi Kamu</Text>
                            <TouchableOpacity>
                                <Text style={styles.textDesc}>Rp {komisi.toLocaleString("id-ID")}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => openWhatsApp()}>
                            <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    source={require('../asset/topup.png')}  // Local image
                                    style={{ width: 20, height: 20, marginBottom: 2, tintColor: '#37AFE1' }}
                                />
                                <Text style={styles.textDesc}>Tarik</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
                <View style={{ margin: 15 }} />
                <ScrollView contentContainerStyle={{ width: 'auto', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', }} horizontal>
                    {banner.map((item, index) => {
                        return (
                            <TouchableOpacity key={index}>
                                <Image source={{ uri: item.image }} style={styles.image} />
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
                <View style={{ margin: 5 }} />

                <Text style={[styles.textTitle, { color: '#000000', textAlign: 'center' }]}>
                    Produk Terbaik Kami
                </Text>
                <View style={styles.barItems}>
                    {bannerNews.map((data, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={() => {
                                navigation.navigate("Detail", {
                                    id: data.id,
                                })
                            }}>
                                <View style={styles.contentTopop}>
                                    <Image source={{ uri: data.image1 }} style={styles.imageBackgrounds} />
                                    <View style={{ margin: 2 }} />
                                    <Text style={styles.textDesc}>{data.nama}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ margin: 10 }} />
                {user.isAgent &&
                    <TouchableOpacity onPress={() => {
                        Clipboard.setString(user.codeReferal);
                        Alert.alert('Disalin', 'Kode referal disalin ke clipboard');
                    }}>
                        <View style={styles.fastTripBar}>
                            <Text style={[styles.textDesc, { color: '#ffffff', fontFamily: 'Montserrat-Regular' }]}>
                                Kode Referal Anda : {user.codeReferal}, Klik untuk salin kode
                            </Text>
                            <Text style={[styles.textDesc, { color: '#ffffff', fontFamily: 'Montserrat-Regular' }]}>
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
                {!user.isAgent &&
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Agent")
                    }}>
                        <View style={styles.fastTripBar}>
                            <Text style={[styles.textDesc, { color: '#ffffff', fontFamily: 'Montserrat-Regular' }]}>
                                Ingin dapat cuan banyak ? yuk klik disini !
                            </Text>
                            <Text style={[styles.textDesc, { color: '#ffffff', fontFamily: 'Montserrat-Regular' }]}>
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
                <View style={{ margin: 20 }} />

                <Text style={[{ color: '#000000', fontFamily: 'Montserrat-normal', textAlign: 'center', width: width - 45 }]}>
                    © Copyright 2025 ABI TEAM
                </Text>
                <View style={{ margin: 10 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 280,
        height: 140,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    containerLoading: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    backgroundStyle: {
        backgroundColor: '#ffffff', flex: 1, justifyContent: 'center', flexDirection: 'column',
    },
    textHeader: {
        width: width - 50,
        fontSize: 20,
        color: '#fff',
        fontFamily: 'Montserrat-Regular'
    },
    textTitle: {
        width: width - 50,
        fontSize: 16,
        fontFamily: 'Montserrat-Regular'
    },
    textDesc: { fontSize: 12, fontFamily: 'Montserrat-Regular' },
    backgroundDesign: {
        position: 'absolute',
        backgroundColor: '#214937',
        width: width,
        height: 180
    },
    barTopup: {
        width: width - 50,
        height: 70,
        backgroundColor: '#fff',
        elevation: 1,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 20,
    },
    barItems: {
        width: width - 50,
        height: 200,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    contentTopop: {
        width: 150,
        height: 150,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBackgrounds: {
        backgroundColor: '#21493750',
        borderRadius: 10,
        width: 150,
        height: 150
    },
    fastTripBar: { width: width - 50, backgroundColor: '#214937', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', padding: 10 },
});

export default HomeScreen;
