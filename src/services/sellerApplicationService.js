import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION = 'sellerApplications';

export async function createSellerApplication(uid, name, email, data) {
  const appData = {
    uid,
    name,
    email,
    storeName: data.storeName,
    storeDescription: data.storeDescription,
    phone: data.phone,
    governorate: data.governorate,
    fullAddress: data.fullAddress,
    status: 'Pending',
    rejectionReason: null,
    submittedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, COLLECTION), appData);
  return { id: docRef.id, ...appData, submittedAt: new Date().toISOString() };
}

export async function getSellerApplicationByUser(uid) {
  const q = query(
    collection(db, COLLECTION),
    where('uid', '==', uid),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getSellerApplicationsByStatus(status) {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const apps = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    let userName = data.name || '';
    let userEmail = data.email || '';
    if (data.uid && (!userName || !userEmail)) {
      const userSnap = await getDoc(doc(db, 'users', data.uid));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName = userName || userData.name || '';
        userEmail = userEmail || userData.email || '';
      }
    }
    apps.push({ id: docSnap.id, ...data, userName, userEmail });
  }
  return apps;
}

export async function approveSellerApplication(appId, uid) {
  await updateDoc(doc(db, COLLECTION, appId), {
    status: 'Approved',
  });
  await updateDoc(doc(db, 'users', uid), {
    role: 'seller',
    sellerSince: new Date().toISOString(),
  });
}

export async function rejectSellerApplication(appId, reason) {
  await updateDoc(doc(db, COLLECTION, appId), {
    status: 'Rejected',
    rejectionReason: reason,
  });
}

export async function updateSellerApplication(appId, data) {
  await updateDoc(doc(db, COLLECTION, appId), {
    storeName: data.storeName,
    storeDescription: data.storeDescription,
    phone: data.phone,
    governorate: data.governorate,
    fullAddress: data.fullAddress,
    status: 'Pending',
    rejectionReason: null,
    submittedAt: serverTimestamp(),
  });
}