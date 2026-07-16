import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy as fbOrderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COL = 'categories';

export const createCategory = async ({ name, subcategories }) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const snap = await getDocs(query(collection(db, COL), fbOrderBy('order', 'desc')));
  const maxOrder = snap.docs.length > 0 ? (snap.docs[0].data().order || 0) : 0;
  const docRef = await addDoc(collection(db, COL), {
    name,
    slug,
    order: maxOrder + 1,
    subcategories: subcategories || [],
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, name, slug, order: maxOrder + 1, subcategories: subcategories || [] };
};

export const getAllCategories = async () => {
  const q = query(collection(db, COL), fbOrderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateCategory = async (id, { name, subcategories }) => {
  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (subcategories !== undefined) updates.subcategories = subcategories;
  await updateDoc(doc(db, COL, id), updates);
};

export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, COL, id));
};
