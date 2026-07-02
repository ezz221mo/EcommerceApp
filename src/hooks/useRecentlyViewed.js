import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'luxe-recently-viewed';
const MAX_ITEMS = 12;

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

export default function useRecentlyViewed() {
  const [items, setItems] = useState(loadLocal);

  useEffect(() => {
    saveLocal(items);
  }, [items]);

  const addItem = useCallback((product) => {
    setItems(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [{ ...product, _viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return { items, addItem, clearAll };
}
