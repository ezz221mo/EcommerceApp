import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy as fbOrderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Recursively clean a value for Firestore compatibility.
 * Removes undefined, replaces NaN/Infinity, unsupported types.
 */
function sanitizeForFirestore(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return 0;
    if (!Number.isFinite(val)) return null;
    return val;
  }
  if (typeof val === 'boolean') return val;
  if (typeof val === 'bigint') return Number(val);
  if (typeof val === 'symbol') return val.description || null;
  if (typeof val === 'function') return null;
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) {
    const cleaned = val.map(sanitizeForFirestore).filter(v => v !== undefined && v !== null);
    return cleaned.length > 0 ? cleaned : [];
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return null;
    const obj = {};
    for (const k of keys) {
      const v = sanitizeForFirestore(val[k]);
      if (v !== undefined && v !== null) {
        obj[k] = v;
      }
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }
  return null;
}

/**
 * Create a new order in Firestore.
 *
 * Accepted fields:
 *   userId, customerInfo { fullName, email, phone, address, city, zip },
 *   items [{ id, name, price, quantity, image, sellerEmail }],
 *   subtotal, shipping, tax, discount, total,
 *   paymentMethod { type, last4 },
 *   couponCode
 */
export const createOrder = async ({
  userId,
  customerInfo,
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  paymentMethod,
  couponCode,
}) => {
  // ── 1. Build clean items ───────────────────────────────────────────────
  const mappedItems = items
    .filter(item => item != null)
    .map(item => ({
      id:           sanitizeForFirestore(item.id),
      name:         sanitizeForFirestore(item.name) || '',
      price:        sanitizeForFirestore(item.price) || 0,
      quantity:     sanitizeForFirestore(item.quantity) || 1,
      image:        sanitizeForFirestore(item.image) || '',
      sellerEmail:  (sanitizeForFirestore(item.sellerEmail) || 'admin@luxe.com').toLowerCase(),
    }))
    .filter(i => i.name);

  // ── 2. Build order payload ─────────────────────────────────────────────
  const orderPayload = {
    userId: sanitizeForFirestore(userId) || '',
    customerInfo: {
      fullName: sanitizeForFirestore(customerInfo?.fullName) || '',
      email:    sanitizeForFirestore(customerInfo?.email) || '',
      phone:    sanitizeForFirestore(customerInfo?.phone) || '',
      address:  sanitizeForFirestore(customerInfo?.address) || '',
      city:     sanitizeForFirestore(customerInfo?.city) || '',
      zip:      sanitizeForFirestore(customerInfo?.zip) || '',
    },
    items: mappedItems,
    sellerEmails: [...new Set(mappedItems.map(i => i.sellerEmail))],
    subtotal:  sanitizeForFirestore(subtotal) || 0,
    shipping:  sanitizeForFirestore(shipping) || 0,
    tax:       sanitizeForFirestore(tax) || 0,
    discount:  sanitizeForFirestore(discount) || 0,
    total:     sanitizeForFirestore(total) || 0,
    paymentMethod: {
      type:  sanitizeForFirestore(paymentMethod?.type) || 'Unknown',
      last4: sanitizeForFirestore(paymentMethod?.last4) || '',
    },
    couponCode: sanitizeForFirestore(couponCode) || null,
    status: 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // ── 3. Debug log the clean payload (dev only) ───────────────────────────
  if (import.meta.env.DEV) {
    const { createdAt, updatedAt, ...logSafe } = orderPayload;
    console.log('[orderService] createOrder payload:', logSafe);
  }

  // ── 4. Write to Firestore ──────────────────────────────────────────────
  const docRef = await addDoc(collection(db, 'orders'), orderPayload);

  // ── 5. Return clean result (no FieldValue sentinels) ────────────────────
  const now = new Date().toISOString();
  return {
    id: docRef.id,
    ...orderPayload,
    createdAt: now,
    updatedAt: now,
  };
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function mapDoc(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
  };
}

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    fbOrderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const getSellerOrders = async (sellerEmail) => {
  const email = sellerEmail.toLowerCase();
  const q = query(
    collection(db, 'orders'),
    where('sellerEmails', 'array-contains', email),
    fbOrderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const getAllOrders = async () => {
  const q = query(collection(db, 'orders'), fbOrderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const updateOrderStatus = async (orderId, status) => {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  return { id: orderId, status };
};

export const getOrder = async (orderId) => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};
