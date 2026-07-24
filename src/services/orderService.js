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
import { adjustStockAtomic } from './productService';

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
 *   userId, customerInfo { fullName, email, phone, address, city, zip, governorate },
 *   items [{ id, name, price, quantity, image, sellerEmail }],
 *   subtotal, shipping, tax, discount, total,
 *   paymentMethod { type, last4 },
 *   couponCode, estimatedDelivery
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
  estimatedDelivery,
}) => {
  // ── 1. Build clean items ───────────────────────────────────────────────
  const mappedItems = items
    .filter(item => item != null)
    .map(item => ({
      id:       sanitizeForFirestore(item.id),
      name:     sanitizeForFirestore(item.name) || '',
      price:    sanitizeForFirestore(item.price) || 0,
      quantity: sanitizeForFirestore(item.quantity) || 1,
      image:    sanitizeForFirestore(item.image) || '',
    }))
    .filter(i => i.name);

  // ── 2. Build order payload ─────────────────────────────────────────────
  const orderPayload = {
    userId: sanitizeForFirestore(userId) || '',
    customerInfo: {
      uid:         sanitizeForFirestore(customerInfo?.uid) || '',
      fullName:    sanitizeForFirestore(customerInfo?.fullName) || '',
      email:       sanitizeForFirestore(customerInfo?.email) || '',
      phone:       sanitizeForFirestore(customerInfo?.phone) || '',
      address:     sanitizeForFirestore(customerInfo?.address) || '',
      city:        sanitizeForFirestore(customerInfo?.city) || '',
      zip:         sanitizeForFirestore(customerInfo?.zip) || '',
      governorate: sanitizeForFirestore(customerInfo?.governorate) || '',
    },
    items: mappedItems,
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
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    estimatedDelivery: sanitizeForFirestore(estimatedDelivery) || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // ── 3. Debug log the clean payload (dev only) ───────────────────────────
  if (import.meta.env.DEV) {
    const { createdAt, updatedAt, ...logSafe } = orderPayload;
    console.log('[orderService] createOrder payload:', logSafe);
  }

  // ── 4. Save stock snapshot before reduction ───────────────────────────
  const stockBefore = {};
  for (const item of mappedItems) {
    try {
      console.log('[createOrder] Reading stock for product:', item.id);
      const snap = await getDoc(doc(db, 'products', item.id));
      if (snap.exists()) {
        const currentStock = parseInt(snap.data().stock);
        if (!isNaN(currentStock)) {
          stockBefore[item.id] = currentStock;
          console.log('[createOrder] Product', item.id, 'current stock:', currentStock);
        } else {
          console.log('[createOrder] Product', item.id, 'has no numeric stock field, skipping');
        }
      } else {
        console.log('[createOrder] Product', item.id, 'not found, skipping');
      }
    } catch (stockErr) {
      console.error('[createOrder] Failed to read stock for product:', item.id, stockErr);
    }
  }

  // ── 5. Write to Firestore ──────────────────────────────────────────────
  console.log('[createOrder] Creating order document...');
  console.log('[createOrder] Order payload:', JSON.stringify({ ...orderPayload, createdAt: '[SERVER TIMESTAMP]', updatedAt: '[SERVER TIMESTAMP]' }));
  const docRef = await addDoc(collection(db, 'orders'), orderPayload);
  console.log('[createOrder] Order created successfully, doc ID:', docRef.id);

  // ── 6. Reduce stock atomically for each item ────────────────────────────
  for (const item of mappedItems) {
    if (stockBefore[item.id] !== undefined) {
      console.log('[createOrder] Adjusting stock for item:', item.id, 'delta:', -item.quantity, 'stock before:', stockBefore[item.id]);
      try {
        await adjustStockAtomic(item.id, -item.quantity);
        console.log('[createOrder] Stock adjusted for item:', item.id);
      } catch (stockUpdateErr) {
        console.error('[createOrder] Stock adjustment FAILED for item:', item.id, stockUpdateErr);
        console.error('[createOrder] Stock update error code:', stockUpdateErr?.code);
        console.error('[createOrder] Stock update error message:', stockUpdateErr?.message);
        throw stockUpdateErr;
      }
    } else {
      console.log('[createOrder] Skipping stock adjustment for item:', item.id, '(no stock tracking)');
    }
  }

  // ── 7. Auto-assign delivery based on governorate ──────────────────────
  const governorate = customerInfo?.governorate?.trim();
  if (governorate) {
    console.log('[createOrder] Attempting delivery auto-assignment for governorate:', governorate);
    try {
      const { assignDeliveryOrder } = await import('./deliveryService');
      const assigned = await assignDeliveryOrder(docRef.id, governorate);
      if (assigned) {
        console.log('[createOrder] Delivery auto-assigned successfully to:', assigned.name);
      } else {
        console.log('[createOrder] No matching delivery for', governorate, '- keeping as Pending');
        try {
          await updateDoc(doc(db, 'orders', docRef.id), {
            orderStatus: 'Pending',
            updatedAt: serverTimestamp(),
          });
          console.log('[createOrder] Order status set to Pending');
        } catch (updateErr) {
          console.error('[createOrder] Failed to set Processing status:', updateErr?.code, updateErr?.message, updateErr);
        }
      }
    } catch (deliveryErr) {
      console.error('[createOrder] Delivery auto-assignment threw:', deliveryErr?.code, deliveryErr?.message, deliveryErr);
      try {
        await updateDoc(doc(db, 'orders', docRef.id), {
          orderStatus: 'Pending',
          updatedAt: serverTimestamp(),
        });
      } catch { /* ignore */ }
    }
  } else {
    console.log('[createOrder] No governorate in customerInfo, skipping delivery assignment');
  }

  // ── 8. Return clean result (no FieldValue sentinels) ────────────────────
  const now = new Date().toISOString();
  // Re-read the order to get updated status (delivery assignment)
  try {
    const orderSnap = await getDoc(doc(db, 'orders', docRef.id));
    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      return {
        id: docRef.id,
        ...orderPayload,
        orderStatus: orderData.orderStatus || orderPayload.orderStatus,
        delivery: orderData.delivery || null,
        timeline: orderData.timeline || null,
        createdAt: now,
        updatedAt: now,
      };
    }
  } catch { /* fall through to default return */ }
  return {
    id: docRef.id,
    ...orderPayload,
    createdAt: now,
    updatedAt: now,
  };
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function mapTimestamps(data) {
  if (!data.timeline) return data;
  return {
    ...data,
    timeline: data.timeline.map(t => ({
      ...t,
      timestamp: t.timestamp?.toDate?.().toISOString() || t.timestamp || null,
    })),
  };
}

function mapDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...mapTimestamps(data),
    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
    orderStatus: data.orderStatus || data.status || 'Pending',
    paymentStatus: data.paymentStatus || 'Pending',
    delivery: data.delivery || null,
    timeline: data.timeline || null,
    customerInfo: data.customerInfo || null,
    items: data.items || [],
    total: data.total || 0,
  };
}

export const getUserOrders = async (userId) => {
  // No orderBy — avoids requiring a composite index in Firestore.
  // Sorting is done client-side below.
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map(mapDoc);
  // Sort newest-first client-side using createdAt ISO string
  orders.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return orders;
};

export const getAllOrders = async () => {
  const q = query(collection(db, 'orders'), fbOrderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const ref = doc(db, 'orders', orderId);

  // Restore stock when order is cancelled
  if (orderStatus === 'Cancelled') {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const order = snap.data();
        for (const item of (order.items || [])) {
          if (item.id && item.quantity) {
            try {
              const productSnap = await getDoc(doc(db, 'products', item.id));
              if (productSnap.exists()) {
                await adjustStockAtomic(item.id, item.quantity);
              }
            } catch { /* skip items without stock tracking */ }
          }
        }
      }
    } catch { /* skip if order not found */ }
  }

  await updateDoc(ref, { orderStatus, updatedAt: serverTimestamp() });

  // Auto-assign delivery when order is confirmed
  if (orderStatus === 'Confirmed') {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const orderData = snap.data();
        const governorate = orderData.customerInfo?.governorate;
        if (governorate) {
          const { assignDeliveryOrder } = await import('./deliveryService');
          await assignDeliveryOrder(orderId, governorate);
        }
      }
    } catch { /* auto-assignment is best-effort */ }
  }

  return { id: orderId, orderStatus };
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { paymentStatus, updatedAt: serverTimestamp() });
  return { id: orderId, paymentStatus };
};

export const getOrder = async (orderId) => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return mapDoc(snap);
};
