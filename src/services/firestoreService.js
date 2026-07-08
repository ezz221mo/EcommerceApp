import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export async function saveUserSubData(uid, collection, docId, data) {
  const ref = doc(db, 'users', uid, collection, docId);
  await setDoc(ref, data);
}

export async function loadUserSubData(uid, collection, docId) {
  const ref = doc(db, 'users', uid, collection, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function deleteUserSubData(uid, collection, docId) {
  const ref = doc(db, 'users', uid, collection, docId);
  await deleteDoc(ref);
}
