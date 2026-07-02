import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null, // { code, percent }

      // Toggle behaviour:
      //   • First click  → adds 1 unit
      //   • Second click (same product, no explicit quantity) → removes it
      // Direct quantity calls (from CartPage stepper) always set the value.
      addItem: (product, quantity = 1, toggle = false) => {
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

      clearCart: () => set({ items: [], coupon: null }),

      isInCart: (id) => get().items.some(i => i.id === id),

      applyDiscount: ({ code, percent }) => {
        if (percent <= 0 || percent > 100) return;
        set({ coupon: { code: code.toUpperCase(), percent } });
      },

      removeDiscount: () => set({ coupon: null }),

      get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0); },
      get totalPrice()  { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
      get discount() {
        const c = get().coupon;
        if (!c) return 0;
        return +(get().totalPrice * (c.percent / 100)).toFixed(2);
      },
      get grandTotal() { return +(get().totalPrice - get().discount).toFixed(2); },
    }),
    { name: 'luxe-cart' }
  )
);

// Wishlist Store
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const exists = get().items.find(i => i.id === product.id);
        if (exists) {
          set(state => ({ items: state.items.filter(i => i.id !== product.id) }));
        } else {
          set(state => ({ items: [...state.items, product] }));
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
    { name: 'luxe-wishlist' }
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

// ── Order Store ───────────────────────────────────────────────────────────────
/*
  Order shape:
  {
    id:          string  (ORD-timestamp)
    buyerEmail:  string
    items:       [{ id, name, price, quantity, image, sellerEmail }]
    subtotal:    number
    shipping:    number
    tax:         number
    total:       number
    status:      'Pending' | 'Delivered'
    placedAt:    ISO string
  }

  Seller balance shape (stored inside sellerBalances map):
  { frozen: number, available: number }
*/
export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],          // all orders across all users
      sellerBalances: {},  // { [sellerEmail]: { frozen, available } }

      // ── Place a new order ──────────────────────────────────────────────────
      placeOrder: ({ buyerEmail, items, subtotal, shipping, tax, total }) => {
        const newOrder = {
          id:         `ORD-${Date.now()}`,
          buyerEmail: buyerEmail.toLowerCase(),
          items,           // each item should carry sellerEmail
          subtotal,
          shipping,
          tax,
          total,
          status:    'Pending',
          placedAt:  new Date().toISOString(),
        };

        // Credit each seller's frozen balance
        const balances = { ...get().sellerBalances };
        items.forEach(item => {
          const se = (item.sellerEmail || '').toLowerCase();
          if (!se) return;
          if (!balances[se]) balances[se] = { frozen: 0, available: 0 };
          balances[se].frozen = +(balances[se].frozen + item.price * item.quantity).toFixed(2);
        });

        set(state => ({
          orders:         [newOrder, ...state.orders],
          sellerBalances: balances,
        }));

        return newOrder;
      },

      // ── Buyer confirms delivery ────────────────────────────────────────────
      confirmDelivery: (orderId) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order || order.status === 'Delivered') return;

        const balances = { ...get().sellerBalances };
        order.items.forEach(item => {
          const se = (item.sellerEmail || '').toLowerCase();
          if (!se) return;
          if (!balances[se]) balances[se] = { frozen: 0, available: 0 };
          const earned = +(item.price * item.quantity).toFixed(2);
          balances[se].frozen    = Math.max(0, +(balances[se].frozen    - earned).toFixed(2));
          balances[se].available = +(balances[se].available + earned).toFixed(2);
        });

        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, status: 'Delivered' } : o
          ),
          sellerBalances: balances,
        }));
      },

      // ── Getters ────────────────────────────────────────────────────────────
      getOrdersByBuyer:  (email) =>
        get().orders.filter(o => o.buyerEmail === email.toLowerCase()),

      getOrdersBySeller: (email) =>
        get().orders.filter(o =>
          o.items.some(i => (i.sellerEmail || '').toLowerCase() === email.toLowerCase())
        ),

      getSellerBalance: (email) =>
        get().sellerBalances[(email || '').toLowerCase()] || { frozen: 0, available: 0 },
    }),
    { name: 'luxe-orders' }
  )
);

// ── Route Persistence Store ───────────────────────────────────────────────────
// Saves the last visited path so we can restore it on refresh
export const useRouteStore = create(
  persist(
    (set) => ({
      lastPath: '/',
      setLastPath: (path) => {
        // Don't persist auth pages — they should always redirect to home after login
        const skipPaths = ['/login', '/register'];
        if (!skipPaths.includes(path)) set({ lastPath: path });
      },
    }),
    { name: 'luxe-route' }
  )
);
// persist → المنتجات بتفضل موجودة بعد الـ refresh
export const useProductStore = create(
  persist(
    (set, get) => ({
      products:      [],
      _initialized:  false,   // flag عشان نعمل init مرة واحدة بس

      // ── تهيئة المنتجات الأساسية من ملف البيانات (بس لو مفيش حاجة متخزنة) ──
      initProducts: async () => {
        // reload if empty so new sample data always loads
        if (get()._initialized && get().products.length > 0) return;
        try {
          const { products } = await import('../data/products');
          set({ products, _initialized: true });
        } catch (e) {
          console.error('initProducts error:', e);
        }
      },

      // ── إضافة منتج جديد (isFeatured: true عشان يظهر في الهوم فوراً) ──
      addProduct: (product) => {
        const newProduct = {
          id:          Date.now(),
          name:        product.name        || 'Untitled',
          price:       parseFloat(product.price) || 0,
          originalPrice: null,
          category:    product.category    || 'electronics',
          image:       product.image       || '',
          images:      product.image ? [product.image] : [],
          description: product.description || '',
          badge:       'New',
          rating:      0,
          reviews:     0,
          inStock:     true,
          isNew:       true,
          isFeatured:  true,               // ✅ يظهر في Featured Products في الهوم
          features:    [],
          createdAt:   new Date().toISOString(),
          sellerEmail: product.sellerEmail || '',
        };
        set(state => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      // ── حذف منتج ──
      deleteProduct: (id) =>
        set(state => ({ products: state.products.filter(p => p.id !== id) })),

      // ── تعديل منتج ──
      updateProduct: (id, updates) =>
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
        })),

      // ── جلب منتج بالـ ID ──
      getProductById: (id) => get().products.find(p => p.id === id),
    }),
    {
      name: 'luxe-products',
      // نحفظ المنتجات والـ flag بس
      partialize: (state) => ({
        products:     state.products,
        _initialized: state._initialized,
      }),
    }
  )
);