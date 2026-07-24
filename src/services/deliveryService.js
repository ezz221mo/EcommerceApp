import {
  doc, collection, getDoc, getDocs, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, adminAuth, auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const COL = 'deliveryAccounts';

function mapDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
  };
}

export async function createDeliveryAccount({ name, email, password, phone, zones }) {
  try {
    const userCred = await createUserWithEmailAndPassword(adminAuth, email, password);
    const uid = userCred.user.uid;

    const userData = {
      uid, name, email, role: 'delivery', photoURL: null, createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), userData);

    const deliveryData = {
      uid, name, email, phone, zones: zones || [], status: 'active',
      lastAssignedAt: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, COL, uid), deliveryData);

    return { id: uid, ...deliveryData };
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use by another account. Please use a different email.');
    }
    throw err;
  }
}

export async function updateDeliveryAccount(uid, { name, phone, zones, status, password }) {
  const updates = { updatedAt: serverTimestamp() };
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (zones !== undefined) updates.zones = zones;
  if (status !== undefined) updates.status = status;
  await updateDoc(doc(db, COL, uid), updates);
  if (name !== undefined) {
    await updateDoc(doc(db, 'users', uid), { name, updatedAt: serverTimestamp() });
  }
}

export async function deleteDeliveryAccount(uid) {
  await deleteDoc(doc(db, COL, uid));
  await deleteDoc(doc(db, 'users', uid));
}

export async function getAllDeliveryAccounts() {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map(mapDoc);
  } catch {
    return [];
  }
}

export async function getDeliveryAccount(uid) {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getDeliveryAccountsByZone(governorate) {
  // Fetch all delivery accounts and filter client-side to avoid
  // exact-match / case-sensitivity issues with array-contains.
  // This ensures "Cairo" matches "cairo " and vice versa.
  try {
    const snap = await getDocs(collection(db, COL));
    const accounts = snap.docs.map(mapDoc);
    const normGov = governorate.trim().toLowerCase();
    return accounts.filter(a => {
      if (a.status !== 'active') return false;
      if (!Array.isArray(a.zones)) return false;
      return a.zones.some(z => z.trim().toLowerCase() === normGov);
    });
  } catch (err) {
    console.error('[deliveryService] getDeliveryAccountsByZone error:', err?.code, err?.message, err);
    return [];
  }
}

export async function assignDeliveryOrder(orderId, governorate) {
  console.log('[assignDeliveryOrder] Looking up delivery for order:', orderId, 'governorate:', governorate);
  const accounts = await getDeliveryAccountsByZone(governorate);
  console.log('[assignDeliveryOrder] Found', accounts.length, 'active delivery accounts for', governorate);
  if (accounts.length === 0) {
    console.log('[assignDeliveryOrder] No delivery available for', governorate, '- marking as unassigned');
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        'delivery.deliveryStatus': 'unassigned',
        'delivery.assignedTo': null, 'delivery.assignedToName': null,
        'delivery.assignedAt': null, 'delivery.updatedAt': null,
        updatedAt: serverTimestamp(),
      });
      console.log('[assignDeliveryOrder] Order', orderId, 'marked as unassigned');
    } catch (updateErr) {
      console.error('[assignDeliveryOrder] Failed to mark order as unassigned:', updateErr?.code, updateErr?.message, updateErr);
    }
    return null;
  }
  // Round-robin: pick deterministically based on orderId hash
  // This avoids relying on lastAssignedAt which can't always be updated
  const hash = orderId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const chosen = accounts[hash % accounts.length];
  console.log('[assignDeliveryOrder] Chosen delivery:', chosen?.name, chosen?.uid || chosen?.id);
  const now = new Date().toISOString();
  const assignedTo = chosen.uid || chosen.id;
  const orderDocPath = doc(db, 'orders', orderId).path;
  console.log('[assignDeliveryOrder] Updating order:', orderDocPath);
  console.log('[assignDeliveryOrder] Setting delivery.assignedTo:', assignedTo, 'delivery.assignedToName:', chosen.name);
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      'delivery.assignedTo': assignedTo,
      'delivery.assignedToName': chosen.name,
      'delivery.deliveryStatus': 'assigned',
      'delivery.assignedAt': now, 'delivery.updatedAt': now,
      'delivery.returnReason': null,
      updatedAt: serverTimestamp(),
    });
    console.log('[assignDeliveryOrder] Order', orderId, 'assigned to', chosen.name, '(uid:', assignedTo, ')');
  } catch (updateErr) {
    console.error('[assignDeliveryOrder] FAILED to assign order', orderId, 'to', chosen.name, ':', updateErr?.code, updateErr?.message, updateErr);
    throw updateErr;
  }
  const deliveryDocRef = doc(db, COL, chosen.uid || chosen.id);
  console.log('[assignDeliveryOrder] Updating lastAssignedAt for delivery account:', deliveryDocRef.path, 'current auth uid:', auth.currentUser?.uid);
  try {
    await updateDoc(deliveryDocRef, {
      lastAssignedAt: now, updatedAt: serverTimestamp(),
    });
    console.log('[assignDeliveryOrder] lastAssignedAt updated successfully for', chosen.name);
  } catch (updateErr) {
    if (updateErr?.code === 'permission-denied') {
      console.log('[assignDeliveryOrder] Skipping lastAssignedAt update — current user lacks permission (expected for non-admin context)');
    } else {
      console.warn('[assignDeliveryOrder] Failed to update lastAssignedAt for', chosen.name, ':', updateErr?.code, updateErr?.message);
    }
  }
  const timelineEntry = { status: 'assigned', timestamp: now, note: `Assigned to ${chosen.name}` };
  try {
    const orderSnap = await getDoc(doc(db, 'orders', orderId));
    const existingTimeline = orderSnap.data()?.timeline || [];
    await updateDoc(doc(db, 'orders', orderId), {
      timeline: [...existingTimeline, timelineEntry],
    });
  } catch (tlErr) {
    console.warn('[assignDeliveryOrder] Failed to add timeline entry:', tlErr?.message);
  }
  return { id: chosen.uid || chosen.id, name: chosen.name };
}

export async function updateDeliveryStatus(orderId, deliveryStatus, note) {
  const now = new Date().toISOString();
  const updates = {
    'delivery.deliveryStatus': deliveryStatus,
    'delivery.updatedAt': now,
    updatedAt: serverTimestamp(),
  };
  const statusOrderMap = {
    confirmed: 'Confirmed',
    out_for_delivery: 'OutForDelivery', delivered: 'Delivered',
    delivery_failed: 'DeliveryFailed', customer_not_available: 'CustomerNotAvailable',
    returned: 'Returned',
  };
  if (statusOrderMap[deliveryStatus]) {
    updates.orderStatus = statusOrderMap[deliveryStatus];
  }
  if (deliveryStatus === 'delivered') {
    updates.paymentStatus = 'Paid';
  }
  if (deliveryStatus === 'returned' && note) {
    updates['delivery.returnReason'] = note;
    updates['delivery.assignedTo'] = null;
    updates['delivery.assignedToName'] = null;
    updates['delivery.deliveryStatus'] = 'returned';
    updates.orderStatus = 'Pending';
  }
  await updateDoc(doc(db, 'orders', orderId), updates);
  const timelineEntry = { status: deliveryStatus, timestamp: now, note: note || deliveryStatus.replace(/_/g, ' ') };
  const orderSnap = await getDoc(doc(db, 'orders', orderId));
  const existingTimeline = orderSnap.data()?.timeline || [];
  await updateDoc(doc(db, 'orders', orderId), {
    timeline: [...existingTimeline, timelineEntry],
  });
}

export async function getDeliveryOrders(deliveryUid) {
  // Single-field where only — no orderBy, which avoids requiring a
  // composite index on delivery.assignedTo + createdAt.
  // Sorting is done client-side.
  console.log('[deliveryService] getDeliveryOrders() deliveryUid:', deliveryUid, 'auth.uid:', auth.currentUser?.uid);
  const q = query(
    collection(db, 'orders'),
    where('delivery.assignedTo', '==', deliveryUid)
  );
  console.log('[deliveryService] getDeliveryOrders() query path: orders where delivery.assignedTo ==', deliveryUid);
  const snap = await getDocs(q);
  console.log('[deliveryService] getDeliveryOrders() found', snap.docs.length, 'orders');
  const orders = snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id, ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
    };
  });
  // Sort newest-first client-side
  orders.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  console.log('[deliveryService] getDeliveryOrders() returning', orders.length, 'orders');
  return orders;
}
