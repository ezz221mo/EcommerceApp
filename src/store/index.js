import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Per‑user cart persistence (Firestore + localStorage) ────────────────────
import { auth } from '../firebase/firebase';
import { getCart as fbGetCart, setCart as fbSetCart, clearCart as fbClearCart } from '../services/cartService';

let _currentCartOwner = null;

function saveToLocalStorage(uid, items, coupon) {
  try {
    localStorage.setItem(`luxe-cart-${uid}`, JSON.stringify({ items, coupon }));
  } catch (e) { /* quota exceeded etc. */ }
}

export async function loadCart(uid) {
  _currentCartOwner = uid;
  console.log('[store] loadCart() uid:', uid, 'auth.uid:', auth.currentUser?.uid);
  // Try Firestore first
  try {
    const remote = await fbGetCart(uid);
    if (remote.items.length > 0) {
      useCartStore.setState({ items: remote.items, coupon: remote.coupon });
      saveToLocalStorage(uid, remote.items, remote.coupon);
      console.log('[store] loadCart() loaded', remote.items.length, 'items from Firestore');
      return;
    }
  } catch (e) {
    console.warn('[store] loadCart() Firestore fallback to localStorage:', e?.message);
  }
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(`luxe-cart-${uid}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      useCartStore.setState({ items: parsed.items || [], coupon: parsed.coupon || null });
      console.log('[store] loadCart() loaded', parsed.items?.length, 'items from localStorage');
      return;
    }
  } catch (e) { /* ignore */ }
  useCartStore.setState({ items: [], coupon: null });
}

export function clearCartSession() {
  _currentCartOwner = null;
  useCartStore.setState({ items: [], coupon: null });
}

// Cart Store
export const useCartStore = create(
  (set, get) => ({
    items: [],
    coupon: null,

    addItem: (product, quantity = 1, toggle = false) => {
      if (!_currentCartOwner) return;
      const maxStock = product.stock ? parseInt(product.stock) : Infinity;
      const existing = get().items.find(i => i.id === product.id);

      if (existing) {
        if (toggle) {
          set(state => ({
            items: state.items.filter(i => i.id !== product.id),
          }));
        } else {
          const newQty = Math.min(existing.quantity + quantity, maxStock);
          set(state => ({
            items: state.items.map(i =>
              i.id === product.id ? { ...i, quantity: newQty } : i
            ),
          }));
        }
      } else {
        const cappedQty = Math.min(quantity, maxStock);
        set(state => ({
          items: [...state.items, { ...product, quantity: cappedQty }],
        }));
      }
    },

    removeItem: (id) =>
      set(state => ({ items: state.items.filter(i => i.id !== id) })),

    updateQuantity: (id, quantity) => {
      if (quantity <= 0) { get().removeItem(id); return; }
      const item     = get().items.find(i => i.id === id);
      const maxStock = item?.stock ? parseInt(item.stock) : Infinity;
      const capped   = Math.min(quantity, maxStock);
      set(state => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity: capped } : i),
      }));
    },

    increaseQuantity: (id) => {
      const item = get().items.find(i => i.id === id);
      if (!item) return;
      const maxStock = item.stock ? parseInt(item.stock) : Infinity;
      if (item.quantity >= maxStock) return;
      set(state => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    },

    decreaseQuantity: (id) => {
      const item = get().items.find(i => i.id === id);
      if (!item) return;
      if (item.quantity <= 1) { get().removeItem(id); return; }
      set(state => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }));
    },

    clearCart: () => {
      set({ items: [], coupon: null });
      const owner = _currentCartOwner;
      const currentUid = auth.currentUser?.uid;
      console.log('[store] clearCart() owner:', owner, 'auth.uid:', currentUid);
      if (owner && currentUid && owner === currentUid) {
        fbClearCart(owner).catch(() => {});
      } else if (owner) {
        console.warn('[store] clearCart() skipped — owner', owner, '!= auth.uid', currentUid);
      }
    },

    isInCart: (id) => get().items.some(i => i.id === id),

    applyDiscount: ({ code, percent, type, value, description }) => {
      const t = type || 'percentage';
      if (t === 'percentage' && (percent <= 0 || percent > 100)) return;
      if (t === 'fixed' && (value <= 0)) return;
      if (t === 'free_shipping' && (value <= 0)) return;
      set({ coupon: { code: code.toUpperCase(), percent: percent || 0, type: t, value: value || 0, description: description || '' } });
    },

    removeDiscount: () => set({ coupon: null }),

    get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0); },
    get totalPrice()  { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
    get discount() {
      const c = get().coupon;
      if (!c) return 0;
      const total = get().totalPrice;
      switch (c.type) {
        case 'fixed':
          return Math.min(c.value, total);
        case 'free_shipping':
          return c.value || 0;
        default:
          return +(total * (c.percent / 100)).toFixed(2);
      }
    },
    get grandTotal() { return +(get().totalPrice - get().discount).toFixed(2); },
  })
);

// Auto-save cart to localStorage + Firestore on every change
useCartStore.subscribe((state) => {
  const owner = _currentCartOwner;
  const currentUid = auth.currentUser?.uid;
  if (owner) {
    saveToLocalStorage(owner, state.items, state.coupon);
    if (currentUid && owner === currentUid) {
      fbSetCart(owner, state.items, state.coupon).catch(() => {});
    } else {
      console.log('[store] subscribe() skip Firestore — owner:', owner, 'auth.uid:', currentUid);
    }
  }
});

// Wishlist Store
const MINIMAL_FIELDS = ['id', 'name', 'price', 'image', 'category', 'sizes', 'colors', 'inStock', 'originalPrice', 'badge', 'rating', 'reviews'];

function pickMinimal(product) {
  const picked = {};
  MINIMAL_FIELDS.forEach(k => { picked[k] = product[k]; });
  return picked;
}

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const exists = get().items.find(i => i.id === product.id);
        if (exists) {
          set(state => ({ items: state.items.filter(i => i.id !== product.id) }));
        } else {
          set(state => ({ items: [...state.items, pickMinimal(product)] }));
        }
      },
      isWishlisted: (id) => get().items.some(i => i.id === id),
      moveToCart: (productId) => {
        const product = get().items.find(i => i.id === productId);
        if (!product) return;
        useCartStore.getState().addItem(product, 1, false);
        set(state => ({ items: state.items.filter(i => i.id !== productId) }));
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'luxe-wishlist',
      version: 1,
      migrate: (persistedState) => {
        if (persistedState && Array.isArray(persistedState.items)) {
          return {
            items: persistedState.items.map(p => pickMinimal(p)),
          };
        }
        return { items: [] };
      },
    }
  )
);

// Theme Store
export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const next = !get().isDark;
        set({ isDark: next });

        const root = document.documentElement;
        if (next) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      initTheme: () => {
        const isDark = get().isDark;
        const root   = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
    }),
    { name: 'luxe-theme' }
  )
);

// Clear old localStorage caches (migrated to Firestore)
try { localStorage.removeItem('luxe-orders'); } catch {}
try { localStorage.removeItem('luxe-products'); } catch {}

// ── Order Store ───────────────────────────────────────────────────────────────
/*
  Firestore-backed order store.

  Data shape (Firestore doc):
    id, userId, customerInfo { fullName, email, phone, address, city, zip },
    items [{ id, name, price, quantity, image, sellerEmail }],
    sellerEmails [string],
    subtotal, shipping, tax, discount, total,
    paymentMethod { type, last4 },
    couponCode, status, createdAt, updatedAt

  Local cache (in-memory) for synchronous reads.
*/
import {
  createOrder as fbCreateOrder,
  getUserOrders as fbGetUserOrders,
  getAllOrders as fbGetAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../services/orderService';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  loaded: false,

  fetchUserOrders: async (userId) => {
    set({ loading: true });
    try {
      const orders = await fbGetUserOrders(userId);
      set({ orders, loading: false, loaded: true });
    } catch (err) {
      console.error('[OrderStore] fetchUserOrders error:', err?.code, err?.message, err);
      set({ loading: false });
    }
  },

  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const orders = await fbGetAllOrders();
      set({ orders, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  placeOrder: async ({
    userId, customerInfo, items, subtotal, shipping, tax, discount,
    total, paymentMethod, couponCode, estimatedDelivery,
  }) => {
    const created = await fbCreateOrder({
      userId, customerInfo, items, subtotal, shipping, tax, discount,
      total, paymentMethod, couponCode, estimatedDelivery,
    });
    set(state => ({ orders: [created, ...state.orders] }));
    // Refresh product stock after order placement
    useProductStore.getState().fetchProducts();
    return created;
  },

  confirmDelivery: async (orderId) => {
    await updateOrderStatus(orderId, 'Delivered');
    await updatePaymentStatus(orderId, 'Paid');
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, orderStatus: 'Delivered', paymentStatus: 'Paid' } : o
      ),
    }));
  },

  updateOrder: async (orderId, updates) => {
    if (updates.orderStatus) {
      await updateOrderStatus(orderId, updates.orderStatus);
    }
    if (updates.paymentStatus) {
      await updatePaymentStatus(orderId, updates.paymentStatus);
    }
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
    }));
    // Refresh product stock after status changes that affect inventory
    if (updates.orderStatus && ['Cancelled', 'Delivered'].includes(updates.orderStatus)) {
      useProductStore.getState().fetchProducts();
    }
  },

  getOrdersByBuyer: (userId) =>
    get().orders.filter(o =>
      o.userId === userId || o.customerInfo?.uid === userId
    ),

  getRevenue: () => {
    const orders = get().orders;
    return {
      total: orders.reduce((s, o) => s + (o.total || 0), 0),
      pending: orders.filter(o => (o.orderStatus || o.status) === 'Pending').reduce((s, o) => s + (o.total || 0), 0),
      delivered: orders.filter(o => (o.orderStatus || o.status) === 'Delivered').reduce((s, o) => s + (o.total || 0), 0),
      count: orders.length,
    };
  },
}));

// ── Category Store (Firestore-backed) ─────────────────────────────────────────
export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  loaded: false,

  fetchCategories: async (force) => {
    if (!force && get().loaded) return;
    set({ loading: true });
    try {
      const { getAllCategories } = await import('../services/categoryService');
      const categories = await getAllCategories();
      set({ categories, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  getCategoryBySlug: (slug) => get().categories.find(c => c.slug === slug),

  getSubcategories: (slug) => {
    const cat = get().categories.find(c => c.slug === slug);
    return cat?.subcategories || [];
  },
}));

// ── Product Store (Firestore-backed) ──────────────────────────────────────────
export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { getAllProducts } = await import('../services/productService');
      const products = await getAllProducts();
      set({ products, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error('fetchProducts error:', e);
    }
  },

  addProduct: async (data) => {
    const { createProduct } = await import('../services/productService');
    const productData = {
      name: data.name || 'Untitled',
      price: parseFloat(data.price) || 0,
      originalPrice: data.originalPrice ?? null,
      category: data.category || '',
      subcategory: data.subcategory || '',
      image: (data.images?.[0]) || data.image || '',
      images: data.images?.filter(Boolean) || (data.image ? [data.image] : []),
      description: data.description || '',
      badge: data.badge || 'New',
      rating: data.rating ?? 0,
      reviews: data.reviews ?? 0,
      inStock: data.inStock ?? true,
      isNew: data.isNew ?? true,
      features: data.features || [],
      tags: data.tags || [],
      stock: data.stock ?? null,
      sellerEmail: data.sellerEmail || '',
      shipping: data.shipping || null,
      sizes: data.sizes || [],
      colors: data.colors || [],
    };
    const created = await createProduct(productData);
    set(state => ({ products: [created, ...state.products] }));
    return created;
  },

  deleteProduct: async (id) => {
    const { deleteProductFromFirestore } = await import('../services/productService');
    await deleteProductFromFirestore(id);
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
  },

  updateProduct: async (id, updates) => {
    const { updateProductInFirestore } = await import('../services/productService');
    await updateProductInFirestore(id, updates);
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  },

  getProductById: (id) => get().products.find(p => p.id === id),
}));