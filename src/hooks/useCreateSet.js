import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { saveSetDoc, getAllSetDocs, deleteSetDoc } from '../services/firestoreService';
import toast from 'react-hot-toast';

const SET_PERSIST_DEBOUNCE = 1200;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function useCreateSet() {
  const { currentUser } = useAuth();

  // الحالة تخزن فقط الـ IDs والبيانات الأساسية للـ Set
  const [sets, setSets] = useState(() => {
    try {
      const local = localStorage.getItem('luxe-custom-sets-v2');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [loaded, setLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  /* ── Load from Firestore ── */
  useEffect(() => {
    setLoaded(false);
    setLoadingError(null);

    if (!currentUser) {
      setSets([]);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const docs = await getAllSetDocs(currentUser.uid);
        if (cancelled) return;

        if (docs && docs.length > 0) {
          const parsed = docs.map(d => ({
            id: d.id,
            category: d.category || null,
            productIds: d.productIds || d.products || [], // الحفاظ على التوافق مع الكود القديم
            createdAt: d.createdAt || Date.now(),
            updatedAt: d.updatedAt || Date.now(),
          }));
          setSets(parsed);
        } else {
          try {
            const localSets = localStorage.getItem('luxe-custom-sets-v2');
            if (localSets) setSets(JSON.parse(localSets));
          } catch {}
        }
      } catch (e) {
        if (!cancelled) setLoadingError(e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser]);

  /* ── LocalStorage & Firestore Persist ── */
  const persistRef = useRef({ sets });
  persistRef.current = { sets };

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem('luxe-custom-sets-v2', JSON.stringify(sets));
    } catch {}

    if (!currentUser) return;

    const timer = setTimeout(async () => {
      const { sets: s } = persistRef.current;
      try {
        await Promise.all(
          s.map(set =>
            saveSetDoc(currentUser.uid, set.id, {
              category: set.category || null,
              productIds: set.productIds, // نحفظ الـ IDs فقط
              createdAt: set.createdAt || Date.now(),
              updatedAt: Date.now(),
            })
          )
        );
      } catch (err) {
        console.error("Error saving sets to Firestore:", err);
      }
    }, SET_PERSIST_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [sets, loaded, currentUser]);

  /* ── createNewSet ── */
  const createNewSet = useCallback(() => {
    const setId = uid();
    const now = Date.now();
    setSets(prev => [...prev, {
      id: setId, category: null, productIds: [], createdAt: now, updatedAt: now,
    }]);
    return setId; // نرجع الـ ID عشان الصفحة توجهك ليه فوراً
  }, []);

  /* ── addProduct ── */
  const addProduct = useCallback((setId, product) => {
    if (!product || !setId) return;

    setSets(prev => {
      const idx = prev.findIndex(s => s.id === setId);
      if (idx === -1) return prev;
      const set = prev[idx];

      if (set.category && product.category !== set.category) {
        toast.error(`This Set already belongs to ${set.category}.`, {
          style: { borderRadius: '12px', background: '#dc2626', color: '#fff' },
        });
        return prev;
      }

      const strId = String(product.id);
      if (set.productIds.includes(strId)) {
        toast('This product is already in your set.', { icon: 'ℹ️', style: { borderRadius: '12px' } });
        return prev;
      }

      const next = [...prev];
      next[idx] = {
        ...set,
        productIds: [...set.productIds, strId],
        category: set.category || product.category || null,
        updatedAt: Date.now(),
      };
      return next;
    });
  }, []);

  /* ── removeProduct ── */
  const removeProduct = useCallback((setId, productId) => {
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === setId);
      if (idx === -1) return prev;
      const set = prev[idx];
      
      const filtered = set.productIds.filter(id => String(id) !== String(productId));
      const next = [...prev];
      next[idx] = {
        ...set, productIds: filtered,
        category: filtered.length > 0 ? set.category : null, // نحتفظ بالقسم أو نصفره لو فضيت
        updatedAt: Date.now(),
      };
      return next;
    });
  }, []);

  /* ── clearSet ── */
  const clearSet = useCallback((setId) => {
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === setId);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], productIds: [], category: null, updatedAt: Date.now() };
      return next;
    });
  }, []);

  /* ── deleteSet ── */
  const deleteSet = useCallback((setId) => {
    setSets(prev => prev.filter(s => s.id !== setId));
    if (currentUser) {
      deleteSetDoc(currentUser.uid, setId).catch(() => {});
    }
  }, [currentUser]);

  return {
    sets, loaded, loadingError,
    createNewSet, addProduct, removeProduct, clearSet, deleteSet
  };
}