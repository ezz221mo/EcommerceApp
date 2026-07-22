import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

function assertOwnUid(uid) {
  const current = auth.currentUser?.uid;
  if (!current) {
    console.warn('[cartService] No authenticated user — uid:', uid);
    return false;
  }
  if (current !== uid) {
    console.warn('[cartService] uid mismatch — passed:', uid, 'auth.currentUser.uid:', current);
    return false;
  }
  return true;
}

export async function getCart(uid) {
  if (!assertOwnUid(uid)) {
    console.error('[cartService] getCart() blocked — uid does not match current user');
    return { items: [], coupon: null };
  }
  const path = `carts/${uid}`;
  console.log('[cartService] getCart() path:', path, 'auth.uid:', auth.currentUser?.uid);
  try {
    const snap = await getDoc(doc(db, 'carts', uid));
    if (snap.exists()) {
      const data = snap.data();
      console.log('[cartService] getCart() found doc, items:', data.items?.length);
      return { items: data.items || [], coupon: data.coupon || null };
    }
    console.log('[cartService] getCart() no doc exists for', uid);
  } catch (e) {
    console.error('[cartService] getCart() error — path:', path, 'code:', e?.code, 'message:', e?.message);
  }
  return { items: [], coupon: null };
}

export async function setCart(uid, items, coupon) {
  if (!assertOwnUid(uid)) {
    console.error('[cartService] setCart() blocked — uid does not match current user');
    return;
  }
  const path = `carts/${uid}`;
  console.log('[cartService] setCart() path:', path, 'items:', items?.length, 'auth.uid:', auth.currentUser?.uid);
  try {
    const data = { items, coupon: coupon || null, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'carts', uid), data);
    console.log('[cartService] setCart() succeeded');
  } catch (e) {
    console.error('[cartService] setCart() error — path:', path, 'code:', e?.code, 'message:', e?.message);
  }
}

export async function clearCart(uid) {
  if (!assertOwnUid(uid)) {
    console.error('[cartService] clearCart() blocked — uid does not match current user');
    return;
  }
  const path = `carts/${uid}`;
  console.log('[cartService] clearCart() path:', path, 'auth.uid:', auth.currentUser?.uid);
  try {
    await deleteDoc(doc(db, 'carts', uid));
    console.log('[cartService] clearCart() succeeded');
  } catch (e) {
    console.error('[cartService] clearCart() error — path:', path, 'code:', e?.code, 'message:', e?.message);
  }
}
