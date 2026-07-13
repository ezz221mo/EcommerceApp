import { doc, getDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
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

/* ── Create Your Set — per-set subcollection ── */

function setRef(uid, setId) {
  return doc(db, 'users', uid, 'sets', setId);
}

function metaRef(uid) {
  return doc(db, 'users', uid, 'sets', '_meta');
}

function setsCollection(uid) {
  return collection(db, 'users', uid, 'sets');
}

export async function saveSetDoc(uid, setId, data) {
  await setDoc(setRef(uid, setId), data);
}

export async function getSetDoc(uid, setId) {
  const snap = await getDoc(setRef(uid, setId));
  return snap.exists() ? snap.data() : null;
}

export async function deleteSetDoc(uid, setId) {
  await deleteDoc(setRef(uid, setId));
}

export async function getAllSetDocs(uid) {
  const snap = await getDocs(setsCollection(uid));
  return snap.docs
    .filter(d => d.id !== '_meta')
    .map(d => ({ id: d.id, ...d.data() }));
}

export async function saveSetMeta(uid, data) {
  await setDoc(metaRef(uid), data);
}

export async function getSetMeta(uid) {
  const snap = await getDoc(metaRef(uid));
  return snap.exists() ? snap.data() : null;
}
