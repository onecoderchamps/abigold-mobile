import firestore from '@react-native-firebase/firestore';
import { auth } from '../config/firebaseConfig';

const getUser = async () => {
    const user = auth().currentUser;
    try {
        const doc = await firestore().collection('users').doc(user.uid).get();

        if (doc.exists) {
            const userData = { id: doc.id, ...doc.data() };
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

const getDetailProduct = async ({id}) => {
    try {
        const doc = await firestore().collection('product').doc(id).get();

        if (doc.exists) {
            const userData = { id: doc.id, ...doc.data() };
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

const getrekening = async () => {
    try {
        const doc = await firestore().collection('rekening').doc("XnfqyrIrFCsi3Z02fLiT").get();

        if (doc.exists) {
            const userData = { id: doc.id, ...doc.data() };
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

const getDriver = async (user) => {
    try {
        const doc = await firestore().collection('mitra').doc(user).get();

        if (doc.exists) {
            const userData = { id: doc.id, ...doc.data() };
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

const getBanner = async () => {
    try {
        const snapshot = await firestore().collection('banner').get();

        if (!snapshot.empty) {
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return userData;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const getKurir = async () => {
    try {
        const snapshot = await firestore().collection('kurir').get();

        if (!snapshot.empty) {
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return userData;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const getBannerNews = async () => {
    try {
        const snapshot = await firestore().collection('product').get();

        if (!snapshot.empty) {
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return userData;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const getOrder = async () => {
    const user = auth().currentUser;
    
    if (!user) return []; // Pastikan user sudah login

    try {
        const snapshot = await firestore()
            .collection('order')
            .where('idUser', '==', user.uid)
            .orderBy('createdAt','asc' ) // Gunakan where() untuk filtering
            .get();

        if (!snapshot.empty) {
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const getMember = async () => {
    const user = auth().currentUser;
    
    if (!user) return []; // Pastikan user sudah login

    try {
        const snapshot = await firestore()
            .collection('member')
            .where('idUser', '==', user.uid)
            .orderBy('createdAt','asc' ) // Gunakan where() untuk filtering
            .get();

        if (!snapshot.empty) {
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const getOrderKomisi = async (id) => {
    const user = auth().currentUser;
    if (!user) return []; // Pastikan user sudah login

    try {
        const snapshot = await firestore()
            .collection('order')
            .where('idUser', '==', user.uid)
            .where('isPayedKomisi', '==', false)
            .orderBy('createdAt','asc' ) // Gunakan where() untuk filtering
            .get();

        if (!snapshot.empty) {
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};



export {
    getUser,
    getBanner,
    getOrder,
    getDriver,
    getBannerNews,
    getDetailProduct,
    getKurir,
    getrekening,
    getOrderKomisi,
    getMember
}