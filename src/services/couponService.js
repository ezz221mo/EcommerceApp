import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION = 'coupons';

export async function getAllCoupons() {
  console.log('[CouponService] Fetching all coupons');
  const snapshot = await getDocs(collection(db, COLLECTION));
  const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('[CouponService] Found', results.length, 'coupons');
  return results;
}

export async function getCouponsBySeller(email) {
  console.log('[CouponService] Fetching coupons for seller:', email);
  const q = query(collection(db, COLLECTION), where('createdBy', '==', email.toLowerCase()));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('[CouponService] Seller coupons found:', results.length);
  return results;
}

export async function getCouponById(id) {
  console.log('[CouponService] Fetching coupon by id:', id);
  const snap = await getDoc(doc(db, COLLECTION, id));
  const exists = snap.exists();
  console.log('[CouponService] Coupon exists:', exists);
  return exists ? { id: snap.id, ...snap.data() } : null;
}

// Documents use coupon code as the doc ID — direct lookup, no index needed
export async function getCouponByCode(code) {
  const codeUpper = code.toUpperCase();
  console.log('[CouponService] Looking up coupon by code:', codeUpper);
  const ref = doc(db, COLLECTION, codeUpper);
  const snap = await getDoc(ref);
  const exists = snap.exists();
  console.log('[CouponService] Coupon document exists:', exists);
  if (exists) console.log('[CouponService] Coupon data:', snap.data());
  return exists ? { id: snap.id, ...snap.data() } : null;
}

export async function createCoupon(data) {
  const code = data.code.toUpperCase();
  console.log('[CouponService] Creating coupon:', code);

  // Ensure all numeric fields are stored as numbers
  const value = parseFloat(data.value);
  if (isNaN(value) || value <= 0) {
    throw new Error('Coupon value must be a positive number');
  }

  const minOrderAmount = parseFloat(data.minOrderAmount) || 0;
  const maxUses = parseInt(data.maxUses, 10) || 0;

  console.log('[CouponService] Parsed fields — value:', value, '(type:', typeof value, '), minOrderAmount:', minOrderAmount, '(type:', typeof minOrderAmount, '), maxUses:', maxUses);

  const ref = doc(db, COLLECTION, code);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    console.error('[CouponService] Coupon code already exists:', code);
    throw new Error('A coupon with this code already exists');
  }
  await setDoc(ref, {
    code,
    type: data.type || 'percentage',
    value,
    description: data.description || '',
    minOrderAmount,
    maxUses,
    usedCount: 0,
    expiresAt: data.expiresAt || null,
    isActive: true,
    createdBy: data.createdBy || 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log('[CouponService] Coupon created:', code);
  return code;
}

export async function updateCoupon(id, data) {
  console.log('[CouponService] Updating coupon:', id);
  const updates = { ...data, updatedAt: serverTimestamp() };
  if (data.code) updates.code = data.code.toUpperCase();
  delete updates.id;
  delete updates.createdAt;
  delete updates.usedCount;
  await updateDoc(doc(db, COLLECTION, id), updates);
  console.log('[CouponService] Coupon updated:', id);
}

export async function deleteCoupon(id) {
  console.log('[CouponService] Deleting coupon:', id);
  await deleteDoc(doc(db, COLLECTION, id));
  console.log('[CouponService] Coupon deleted:', id);
}

export async function incrementCouponUsage(id) {
  console.log('[CouponService] Incrementing usage for:', id);
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.warn('[CouponService] Coupon not found for increment:', id);
    return;
  }
  const current = Number(snap.data().usedCount) || 0;
  await updateDoc(ref, { usedCount: current + 1 });
  console.log('[CouponService] Usage incremented:', id, current + 1);
}

export async function validateCoupon(code, subtotal) {
  console.log('[CouponService] Validating coupon:', code, '| subtotal:', subtotal);

  if (!code || !code.trim()) {
    console.warn('[CouponService] No code provided');
    return { valid: false, reason: 'No code provided' };
  }

  const coupon = await getCouponByCode(code);
  if (!coupon) {
    console.warn('[CouponService] Coupon not found in Firestore:', code);
    return { valid: false, reason: 'Invalid coupon code' };
  }

  // Safely parse numeric fields — Firestore may return strings
  const minOrderAmount = Number(coupon.minOrderAmount) || 0;
  const maxUses = Number(coupon.maxUses) || 0;
  const usedCount = Number(coupon.usedCount) || 0;

  console.log('[CouponService] Parsed fields — minOrderAmount:', minOrderAmount, '(type:', typeof minOrderAmount, '), maxUses:', maxUses, ', usedCount:', usedCount);

  console.log('[CouponService] Validation step — isActive:', coupon.isActive);
  if (!coupon.isActive) {
    console.warn('[CouponService] Coupon is not active');
    return { valid: false, reason: 'This coupon is no longer active' };
  }

  if (coupon.expiresAt) {
    const expires = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
    const now = new Date();
    console.log('[CouponService] Validation step — expiresAt:', expires, '| now:', now, '| expired:', expires < now);
    if (expires < now) {
      console.warn('[CouponService] Coupon has expired');
      return { valid: false, reason: 'This coupon has expired' };
    }
  } else {
    console.log('[CouponService] Validation step — no expiry date, skipping');
  }

  console.log('[CouponService] Validation step — maxUses:', maxUses, '| usedCount:', usedCount);
  if (maxUses > 0 && usedCount >= maxUses) {
    console.warn('[CouponService] Coupon usage limit reached');
    return { valid: false, reason: 'This coupon has reached its usage limit' };
  }

  console.log('[CouponService] Validation step — minOrderAmount:', minOrderAmount, '| subtotal:', subtotal);
  if (subtotal < minOrderAmount) {
    console.warn('[CouponService] Subtotal below minimum order amount');
    return { valid: false, reason: `Minimum order amount is $${minOrderAmount.toFixed(2)}` };
  }

  console.log('[CouponService] Coupon validation PASSED');
  return { valid: true, coupon };
}
