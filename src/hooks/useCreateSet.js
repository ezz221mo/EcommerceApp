import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCartStore } from '../store';
import { saveUserSubData, loadUserSubData } from '../services/firestoreService';
import toast from 'react-hot-toast';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const DISCOUNT_TIERS = [
  { min: 15, pct: 50 },
  { min: 10, pct: 40 },
  { min: 7,  pct: 30 },
  { min: 5,  pct: 20 },
  { min: 3,  pct: 10 },
  { min: 0,  pct: 0 },
];

function calcDiscount(count) {
  for (const t of DISCOUNT_TIERS) {
    if (count >= t.min) return t.pct;
  }
  return 0;
}

const DEFAULT = { sets: [], activeSetId: null };

function normalize(raw) {
  if (!raw) return DEFAULT;
  if (Array.isArray(raw.sets) && raw.sets.length > 0) return raw;
  if (raw.sets && typeof raw.sets === 'object' && !Array.isArray(raw.sets)) {
    const ids = Object.keys(raw.sets);
    if (ids.length === 0) return DEFAULT;
    const arr = (raw.index || ids).map(idx => {
      const id = typeof idx === 'string' ? idx : idx.id;
      return {
        id,
        category: raw.sets[id]?.category || null,
        products: raw.sets[id]?.products || [],
        createdAt: idx.createdAt || Date.now(),
      };
    });
    return { sets: arr, activeSetId: raw.activeSetId || arr[0]?.id || null };
  }
  if (Array.isArray(raw.products)) {
    const id = uid();
    return {
      sets: [{ id, category: raw.products[0]?.category || null, products: raw.products, createdAt: Date.now() }],
      activeSetId: id,
    };
  }
  return DEFAULT;
}

export default function useCreateSet() {
  const { currentUser } = useAuth();
  const addItem = useCartStore(s => s.addItem);

  const [sets, setSets] = useState([]);
  const [activeSetId, setActiveSetId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const activeSetIdRef = useRef(activeSetId);
  activeSetIdRef.current = activeSetId;

  const activeSet = sets.find(s => s.id === activeSetId) || null;
  const products = activeSet?.products || [];
  const category = activeSet?.category || null;
  const count = products.length;
  const originalTotal = products.reduce((sum, p) => sum + Number(p.price), 0);
  const discountPct = calcDiscount(count);
  const discountAmount = +(originalTotal * (discountPct / 100)).toFixed(2);
  const finalTotal = +(originalTotal - discountAmount).toFixed(2);

  useEffect(() => {
    if (loaded) return;
    (async () => {
      let raw = null;
      if (currentUser) {
        try { raw = await loadUserSubData(currentUser.uid, 'createSet', 'current'); } catch {}
      }
      const n = normalize(raw);
      setSets(n.sets);
      setActiveSetId(n.activeSetId);
      setLoaded(true);
    })();
  }, [currentUser, loaded]);

  const stateRef = useRef({ sets, activeSetId });
  stateRef.current = { sets, activeSetId };

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      if (currentUser) {
        saveUserSubData(currentUser.uid, 'createSet', 'current', stateRef.current).catch(() => {});
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [sets, activeSetId, currentUser, loaded]);

  const addProduct = useCallback((product, createNew = false) => {
    if (createNew) {
      const setId = uid();
      setSets(prev => [...prev, { id: setId, category: product.category || null, products: [product], createdAt: Date.now() }]);
      setActiveSetId(setId);
    } else {
      const sid = activeSetIdRef.current;
      setSets(prev => {
        const idx = prev.findIndex(s => s.id === sid);
        if (idx === -1) return prev;
        const set = prev[idx];
        if (set.products.some(p => String(p.id) === String(product.id))) {
          toast('This product is already in your set.', { icon: '\u2139\uFE0F', style: { borderRadius: '12px' } });
          return prev;
        }
        const next = [...prev];
        next[idx] = {
          ...set,
          products: [...set.products, product],
          category: set.category || product.category || null,
        };
        return next;
      });
    }
  }, []);

  const removeProduct = useCallback((productId) => {
    const sid = activeSetIdRef.current;
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === sid);
      if (idx === -1) return prev;
      const set = prev[idx];
      const filtered = set.products.filter(p => String(p.id) !== String(productId));
      const next = [...prev];
      next[idx] = { ...set, products: filtered, category: filtered.length > 0 ? filtered[0]?.category : null };
      return next;
    });
  }, []);

  const clearSet = useCallback(() => {
    const sid = activeSetIdRef.current;
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === sid);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], products: [], category: null };
      return next;
    });
  }, []);

  const createNewSet = useCallback(() => {
    const setId = uid();
    setSets(prev => [...prev, { id: setId, category: null, products: [], createdAt: Date.now() }]);
    setActiveSetId(setId);
  }, []);

  const switchSet = useCallback((setId) => {
    setActiveSetId(setId);
  }, []);

  const deleteSet = useCallback((setId) => {
    setSets(prev => {
      const filtered = prev.filter(s => s.id !== setId);
      if (filtered.length === 0) {
        const id = uid();
        setActiveSetId(id);
        return [{ id, category: null, products: [], createdAt: Date.now() }];
      }
      if (setId === activeSetIdRef.current) {
        setActiveSetId(filtered[0].id);
      }
      return filtered;
    });
  }, []);

  const navigate = useNavigate();

  const addToCart = useCallback(() => {
    if (products.length === 0) {
      toast.error('Your set is empty. Add some products first.', { style: { borderRadius: '12px' } });
      return;
    }
    const bundleId = `bundle-${Date.now()}`;
    const bundleItem = {
      id: bundleId,
      name: 'Custom Set',
      price: finalTotal,
      quantity: 1,
      image: products[0]?.image || null,
      _bundle: true,
      bundleItems: products.map(p => ({
        id: p.id, name: p.name, price: p.price, image: p.image, sellerEmail: p.sellerEmail || '',
      })),
      bundleDiscount: { originalTotal, discountPercent: discountPct, discountAmount },
    };
    addItem(bundleItem, 1, false);
    toast.success('Custom Set added to cart!', { icon: '\u{1F4E6}', style: { borderRadius: '12px' } });
    navigate('/cart');
  }, [products, finalTotal, originalTotal, discountPct, discountAmount, addItem, navigate]);

  return {
    products, category, count, loaded,
    originalTotal, discountPercent: discountPct, discountAmount, finalTotal,
    sets, activeSetId,
    addProduct, removeProduct, clearSet, createNewSet, switchSet, deleteSet, addToCart,
  };
}
