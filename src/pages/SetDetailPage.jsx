import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlinePlus, HiOutlineCheck, HiOutlineArrowLeft, HiOutlineSearch } from 'react-icons/hi';
import useCreateSet from '../hooks/useCreateSet';
import { useProductStore, useCartStore } from '../store';
import toast from 'react-hot-toast';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

const TIERS = [
  { min: 3, pct: 10 }, { min: 5, pct: 20 }, { min: 7, pct: 30 },
  { min: 10, pct: 40 }, { min: 15, pct: 50 },
];

function calcDiscount(count) {
  const tier = [...TIERS].reverse().find(t => count >= t.min);
  return tier ? tier.pct : 0;
}

export default function SetDetailPage() {
  const { setId } = useParams(); // التقاط الـ ID من الرابط
  const navigate = useNavigate();
  const { sets, loaded, addProduct, removeProduct, clearSet, createNewSet } = useCreateSet();
  const allProducts = useProductStore(s => s.products);
  const addItem = useCartStore(s => s.addItem);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // استخراج الـ Set الحالي من الهوك
  const currentSet = sets.find(s => s.id === setId);

  // On-The-Fly Resolution: مستحيل تطير أو تبقى 0.00 وقت الريفرش!
  const populatedProducts = useMemo(() => {
    if (!currentSet) return [];
    return currentSet.productIds
      .map(id => allProducts.find(p => String(p.id) === String(id)))
      .filter(Boolean);
  }, [currentSet, allProducts]);

  // الحسابات الرياضية الدقيقة
  const count = populatedProducts.length;
  const category = currentSet?.category || null;
  const originalTotal = populatedProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const discountPct = calcDiscount(count);
  const discountAmount = +(originalTotal * (discountPct / 100)).toFixed(2);
  const finalTotal = +(originalTotal - discountAmount).toFixed(2);
  const nextTier = TIERS.find(t => count < t.min);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [searchQuery, allProducts]);

  const handleSelectProduct = (product) => {
    addProduct(setId, product);
    toast.success(`${product.name} added!`, { icon: '✨', style: { borderRadius: '12px' } });
  };

  const handleAddToCart = () => {
    if (populatedProducts.length === 0) return;
    const bundleItem = {
      id: `bundle-${Date.now()}`, name: 'Custom Set', price: finalTotal, quantity: 1,
      image: populatedProducts[0]?.image || null, _bundle: true,
      bundleItems: populatedProducts.map(p => ({ id: p.id, name: p.name, price: p.price, image: p.image, sellerEmail: p.sellerEmail || '' })),
      bundleDiscount: { originalTotal, discountPercent: discountPct, discountAmount },
    };
    addItem(bundleItem, 1, false);
    toast.success('Set added to cart!', { icon: '📦', style: { borderRadius: '12px' } });
    navigate('/cart');
  };

  if (!loaded || (allProducts.length === 0)) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentSet) {
    return (
      <div className="min-h-screen pt-32 text-center bg-stone-50 dark:bg-stone-950">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Set not found</h2>
        <button onClick={() => navigate('/create-set')} className="mt-4 text-purple-500 hover:underline">Return to Sets</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-set')}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
                {category ? <span className="capitalize">{category}</span> : 'Uncategorized'} Set
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <button onClick={() => clearSet(setId)} className="btn-secondary text-sm"><HiOutlineX className="w-4 h-4" /> Clear</button>
            )}
            <button onClick={() => { const newId = createNewSet(); navigate(`/create-set/${newId}`); }} className="btn-secondary text-sm">
              <HiOutlinePlus className="w-4 h-4" /> New Set
            </button>
          </div>
        </motion.div>

        {count === 0 ? (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineSparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">This set is empty</h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">Add products to build your bundle.</p>
            <button onClick={() => setIsSearching(true)} className="btn-primary text-lg px-8 py-4"><HiOutlinePlus className="w-6 h-6" /> Add Products</button>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 mb-6">
              <div className="px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-sm font-semibold text-purple-700 capitalize flex items-center gap-2"><HiOutlineSparkles className="w-4 h-4"/>{category || 'Various'}</div>
              <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-sm font-semibold text-orange-700">{count} Items</div>
              {discountPct > 0 && <div className="px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-xl text-sm font-semibold text-green-700 flex items-center gap-2"><HiOutlineCheck className="w-4 h-4"/>{discountPct}% Discount</div>}
            </motion.div>

            <div className="overflow-x-auto pb-4 mb-8">
              <div className="flex gap-4 min-w-max">
                <AnimatePresence>
                  {populatedProducts.map((product, i) => (
                    <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="card p-4 w-52 flex-shrink-0">
                      <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-stone-100">
                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                        <button onClick={() => removeProduct(setId, product.id)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-stone-400 hover:text-rose-500"><HiOutlineX className="w-3.5 h-3.5" /></button>
                      </div>
                      <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                      <p className="font-bold mt-1">${Number(product.price).toFixed(2)}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button onClick={() => setIsSearching(true)} className="w-52 flex-shrink-0 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-purple-500 hover:border-purple-400 transition-all bg-stone-50/50">
                  <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center"><HiOutlinePlus className="w-7 h-7" /></div>
                  <span className="text-sm font-semibold">Add Product</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <div className="card p-5 h-full">
                  <h3 className="font-semibold text-sm mb-3">Discount Tiers</h3>
                  <div className="space-y-2">
                    {TIERS.map(tier => (
                      <div key={tier.min} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${count >= tier.min ? 'bg-green-50' : 'bg-stone-100 dark:bg-stone-800'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${count >= tier.min ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                          {count >= tier.min ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{tier.min}+</span>}
                        </div>
                        <span className={`flex-1 font-medium ${count >= tier.min ? 'text-green-700' : 'text-stone-500'}`}>{tier.pct}% off</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="card p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4">Set Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span>Items ({count})</span><span className="font-semibold">${originalTotal.toFixed(2)}</span></div>
                      {discountPct > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discountPct}%)</span><span>-${discountAmount.toFixed(2)}</span></div>}
                      <div className="border-t pt-3 flex justify-between text-xl font-bold"><span>Total</span><span className="text-orange-500">${finalTotal.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <button onClick={handleAddToCart} disabled={count === 0} className="btn-primary-glow w-full py-4 mt-6 text-base justify-center">
                    <HiOutlineShoppingBag className="w-5 h-5" /> Finish Set — ${finalTotal.toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search Modal */}
        <AnimatePresence>
          {isSearching && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearching(false)} />
              <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.96 }} className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b border-stone-100 dark:border-stone-800">
                  <button onClick={() => setIsSearching(false)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"><HiOutlineArrowLeft className="w-5 h-5" /></button>
                  <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {searchResults.map(product => (
                    <button key={product.id} onClick={() => handleSelectProduct(product)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${(category && product.category !== category) ? 'opacity-40' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                      <img src={product.image || ''} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1"><p className="text-sm font-semibold">{product.name}</p></div>
                      <div className="text-right"><p className="text-sm font-bold">${Number(product.price).toFixed(2)}</p></div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}