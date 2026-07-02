import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { saveUserSubData, loadUserSubData } from '../services/firestoreService';
import toast from 'react-hot-toast';

const LS_KEY = 'luxe-compare';
const MAX_ITEMS = 4;

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

export default function useCompare() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      (async () => {
        if (currentUser) {
          try {
            const data = await loadUserSubData(currentUser.uid, 'compare', 'current');
            setItems(data?.items || []);
          } catch {
            setItems(loadLocal());
          }
        } else {
          setItems(loadLocal());
        }
        setLoaded(true);
      })();
    }
  }, [currentUser, loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (currentUser) {
      saveUserSubData(currentUser.uid, 'compare', 'current', { items }).catch(() => {});
    } else {
      saveLocal(items);
    }
  }, [items, currentUser, loaded]);

  const addItem = useCallback((product) => {
    setItems(prev => {
      if (prev.some(p => p.id === product.id)) {
        toast('This product is already in comparison.', {
          icon: '\u{2139}\uFE0F',
          style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
        });
        return prev;
      }
      if (prev.length >= MAX_ITEMS) {
        toast.error(`You can compare up to ${MAX_ITEMS} products at a time. Remove one first.`, {
          style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
        });
        return prev;
      }
      toast.success(`${product.name} added to comparison`, {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    toast('Comparison list cleared', {
      icon: '\u{1F5D1}\uFE0F',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  }, []);

  const isCompared = useCallback((productId) => {
    return items.some(p => p.id === productId);
  }, [items]);

  return { items, addItem, removeItem, clearAll, isCompared };
}
