import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useCartStore } from '../store';
import { saveUserSubData, loadUserSubData } from '../services/firestoreService';
import toast from 'react-hot-toast';

const LS_KEY = 'luxe-outfit';

const emptyOutfit = { top: null, bottom: null, shoes: null, accessory: null };

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...emptyOutfit, ...JSON.parse(raw) } : { ...emptyOutfit };
  } catch {
    return { ...emptyOutfit };
  }
}

function saveLocal(outfit) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(outfit));
  } catch {}
}

export default function useOutfit() {
  const { currentUser } = useAuth();
  const addItem = useCartStore(s => s.addItem);
  const isInCart = useCartStore(s => s.isInCart);

  const [outfit, setOutfit] = useState(() => ({
    top: null, bottom: null, shoes: null, accessory: null,
  }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      (async () => {
        if (currentUser) {
          try {
            const data = await loadUserSubData(currentUser.uid, 'outfits', 'current');
            setOutfit(data ? { ...emptyOutfit, ...data } : { ...emptyOutfit });
          } catch {
            setOutfit(loadLocal());
          }
        } else {
          setOutfit(loadLocal());
        }
        setLoaded(true);
      })();
    }
  }, [currentUser, loaded]);

  const saveRef = useRef(outfit);
  saveRef.current = outfit;

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      if (currentUser) {
        saveUserSubData(currentUser.uid, 'outfits', 'current', saveRef.current).catch(() => {});
      } else {
        saveLocal(saveRef.current);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [outfit, currentUser, loaded]);

  const selectItem = useCallback((slot, product) => {
    setOutfit(prev => ({ ...prev, [slot]: product }));
  }, []);

  const removeItem = useCallback((slot) => {
    setOutfit(prev => ({ ...prev, [slot]: null }));
  }, []);

  const clearOutfit = useCallback(() => {
    setOutfit({ ...emptyOutfit });
  }, []);

  const addToCart = useCallback(() => {
    const items = [outfit.top, outfit.bottom, outfit.shoes, outfit.accessory].filter(Boolean);
    if (items.length === 0) {
      toast.error('Your outfit is empty. Add some items first.', {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
      return;
    }
    let added = 0;
    items.forEach(product => {
      if (!isInCart(product.id)) {
        addItem(product, 1, false);
        added++;
      }
    });
    if (added === 0) {
      toast('All items are already in your cart.', {
        icon: '\u{1F6D2}',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    } else {
      toast.success(`Added ${added} item${added > 1 ? 's' : ''} to cart!`, {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    }
  }, [outfit, addItem, isInCart]);

  const totalPrice = [outfit.top, outfit.bottom, outfit.shoes, outfit.accessory]
    .filter(Boolean)
    .reduce((sum, p) => sum + p.price, 0);

  const filledCount = [outfit.top, outfit.bottom, outfit.shoes, outfit.accessory]
    .filter(Boolean).length;

  return { outfit, selectItem, removeItem, clearOutfit, addToCart, totalPrice, filledCount };
}
