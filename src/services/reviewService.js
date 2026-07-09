import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION = 'reviews';

export async function setReview(productId, uid, data) {
  const docId = `${productId}_${uid}`;
  const ref = doc(db, COLLECTION, docId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      ...data,
      userId: uid,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...data,
      productId,
      uid,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return docId;
}

export async function getReviewsByProduct(productId) {
  const q = query(
    collection(db, COLLECTION),
    where('productId', '==', productId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return results;
}

export async function getUserReview(productId, uid) {
  const docId = `${productId}_${uid}`;
  const ref = doc(db, COLLECTION, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteUserReview(productId, uid) {
  const docId = `${productId}_${uid}`;
  await deleteDoc(doc(db, COLLECTION, docId));
}
