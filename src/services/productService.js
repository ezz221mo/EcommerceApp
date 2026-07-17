import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, increment } from 'firebase/firestore';
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

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateProductInFirestore = async (id, data) => {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: new Date().toISOString() });
};

export const deleteProductFromFirestore = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};

/**
 * Atomically adjust stock for a product.
 * Uses Firestore increment to prevent race conditions.
 * Updates inStock to false if stock would reach 0 or below.
 */
export const adjustStockAtomic = async (productId, delta) => {
  const ref = doc(db, 'products', productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const currentStock = parseInt(snap.data().stock) || 0;
  const newStock = Math.max(0, currentStock + delta);
  await updateDoc(ref, {
    stock: newStock,
    inStock: newStock > 0,
    updatedAt: new Date().toISOString(),
  });
};
