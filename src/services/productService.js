import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const col = collection(db, 'products');

export const createProduct = async (data) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(col, { ...data, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

export const getAllProducts = async () => {
  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateProductInFirestore = async (id, data) => {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: new Date().toISOString() });
};

export const deleteProductFromFirestore = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};
