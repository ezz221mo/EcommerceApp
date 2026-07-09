import { doc, getDoc, getDocs, setDoc, updateDoc, query, collection, where, orderBy, serverTimestamp } from 'firebase/firestore';
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
  await setDoc(doc(db, COLLECTION, uid), appData);
  return { id: uid, ...appData, submittedAt: new Date().toISOString() };
}

export async function getSellerApplicationByUser(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getSellerApplicationsByStatus(status) {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status)
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
  apps.sort((a, b) => {
    const aTime = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
    const bTime = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
    return bTime - aTime;
  });
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