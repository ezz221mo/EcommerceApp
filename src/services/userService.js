import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const createUserDocument = async (uid, name, email) => {
  const userData = {
    uid,
    name,
    email,
    role: 'customer',
    photoURL: null,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), userData);
  return userData;
};

export const getUserDocument = async (uid) => {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

export const updateUserDocument = async (uid, updates) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};
