import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlinePlus, HiOutlineCheck, HiOutlineArrowLeft, HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi';
import useCreateSet from '../hooks/useCreateSet';
import { useProductStore } from '../store';
import toast from 'react-hot-toast';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

const TIERS = [
  { min: 3, pct: 10 },
  { min: 5, pct: 20 },
  { min: 7, pct: 30 },
  { min: 10, pct: 40 },
  { min: 15, pct: 50 },
];

export default function CreateSetPage() {
  const {
    products: setProducts, category, count, loaded,
    originalTotal, discountPercent, discountAmount, finalTotal,
    sets, activeSetId,
    addProduct, removeProduct, clearSet, createNewSet, switchSet, deleteSet, addToCart,
  } = useCreateSet();
  const allProducts = useProductStore(s => s.products);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState('list');
  const [focusedSetId, setFocusedSetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const addProductId = searchParams.get('add');

  useEffect(() => {
    if (!loaded) return;
    if (addProductId) {
      const product = allProducts.find(p => String(p.id) === String(addProductId));
      if (product) {
        addProduct(product, true);
      }
      navigate('/create-set', { replace: true });
    }
  }, [addProductId, allProducts, addProduct, navigate, loaded]);

  const openSetDetail = useCallback((setId) => {
    switchSet(setId);
    setFocusedSetId(setId);
    setView('detail');
  }, [switchSet]);

  const backToList = useCallback(() => {
    setView('list');
    setFocusedSetId(null);
    setSearchQuery('');
  }, []);

  const openSearch = useCallback(() => {
    setSearchQuery('');
    setView('search');
  }, []);

  const closeSearch = useCallback(() => {
    setView('detail');
    setSearchQuery('');
  }, []);

  const handleSelectProduct = useCallback((product) => {
    if (category && product.category !== category) {
      toast.error('Products from another category cannot be added to this Set. Create a new Set to use another category.', {
        style: { borderRadius: '12px', background: '#dc2626', color: '#fff' },
        duration: 4000,
      });
      return;
    }
    addProduct(product);
    toast.success(`${product.name} added to set!`, {
      icon: '\u2728',
      style: { borderRadius: '12px' },
    });
  }, [addProduct, category]);

  const handleCreateNew = useCallback(() => {
    createNewSet();
    setView('list');
  }, [createNewSet]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q)
    ).slice(0, 20);
  }, [searchQuery, allProducts]);

  const nextTier = useMemo(() => {
    return TIERS.find(t => count < t.min);
  }, [count]);

  if (!loaded) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ===== LIST VIEW ===== */}
        {view === 'list' && (
          <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">Create Your Set</h1>
                  <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your custom bundles</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="btn-primary text-sm"
              >
                <HiOutlinePlus className="w-4 h-4" /> Create New Set
              </motion.button>
            </motion.div>

            {sets.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-center py-20">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <HiOutlineSparkles className="w-12 h-12 text-purple-400" />
                </motion.div>
                <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">No sets yet</h2>
                <p className="text-stone-500 mb-8 max-w-md mx-auto">Create your first set to start building a custom bundle and unlock tiered discounts.</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                >
                  <HiOutlinePlus className="w-7 h-7" />
                  Create Your First Set
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sets.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => openSetDetail(s.id)}
                    className="card p-5 cursor-pointer group relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <HiOutlineSparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 capitalize">
                          {s.category || 'Uncategorized'}
                        </span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteSet(s.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-rose-500 transition-all"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        ${s.products.reduce((sum, p) => sum + Number(p.price), 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-stone-500">
                        {s.products.length} product{s.products.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {s.products.length > 0 && (
                      <div className="mt-3 flex -space-x-2">
                        {s.products.slice(0, 4).map(p => (
                          <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-stone-800 overflow-hidden bg-stone-100">
                            <img src={p.image || ''} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {s.products.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white dark:border-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-500">
                            +{s.products.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sets.length * 0.05 }}
                  whileHover={{ y: -4, borderColor: '#a855f7' }}
                  onClick={handleCreateNew}
                  className="card p-5 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-purple-500 hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer min-h-[180px]"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <HiOutlinePlus className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold">Create New Set</span>
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* ===== DETAIL VIEW ===== */}
        {view === 'detail' && (
          <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={backToList}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
                    {category ? <span className="capitalize">{category}</span> : 'Uncategorized'} Set
                  </h1>
                  <p className="text-stone-500 dark:text-stone-400 mt-1">Add products to build your bundle</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { clearSet(); }}
                    className="btn-secondary text-sm"
                  >
                    <HiOutlineX className="w-4 h-4" /> Clear
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNew}
                  className="btn-secondary text-sm"
                >
                  <HiOutlinePlus className="w-4 h-4" /> New Set
                </motion.button>
              </div>
            </motion.div>

            {count === 0 ? (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-center py-20">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <HiOutlineSparkles className="w-10 h-10 text-purple-400" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">This set is empty</h2>
                <p className="text-stone-500 mb-8 max-w-md mx-auto">Add products to build your custom bundle and unlock discounts.</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={openSearch}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                >
                  <HiOutlinePlus className="w-7 h-7" />
                  Add Products
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                    <HiOutlineSparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 capitalize">
                      {category || 'Various'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      {count} item{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
                      <HiOutlineCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {discountPercent}% bundle discount active
                      </span>
                    </div>
                  )}
                </motion.div>

                <div className="overflow-x-auto pb-4 mb-8">
                  <div className="flex gap-4 min-w-max">
                    <AnimatePresence>
                      {setProducts.map((product, i) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 16 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, x: -40 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.04 }}
                          className="card p-4 w-52 flex-shrink-0"
                        >
                          <div className="relative mb-3">
                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                              <img src={product.image || 'https://placehold.co/200?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                              {i + 1}
                            </span>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeProduct(product.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-stone-800 shadow-md flex items-center justify-center text-stone-400 hover:text-rose-500 transition-colors"
                            >
                              <HiOutlineX className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                          <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider capitalize mb-1">{product.category}</p>
                          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{product.name}</h3>
                          <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">${Number(product.price).toFixed(2)}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <motion.button whileHover={{ scale: 1.02, borderColor: '#a855f7' }} whileTap={{ scale: 0.98 }}
                      onClick={openSearch}
                      className="w-52 flex-shrink-0 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-purple-500 hover:border-purple-400 dark:hover:border-purple-500 transition-all bg-stone-50/50 dark:bg-stone-800/20"
                    >
                      <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        <HiOutlinePlus className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold">Add Product</span>
                      {category && (
                        <span className="text-[10px] text-stone-400 capitalize">({category} only)</span>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-2">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 h-full">
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-3">Discount Tiers</h3>
                      <div className="space-y-2">
                        {TIERS.map(tier => {
                          const achieved = count >= tier.min;
                          const isNext = !achieved && (!nextTier || tier.min === nextTier.min);
                          return (
                            <div key={tier.min} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${achieved ? 'bg-green-50 dark:bg-green-950/20' : isNext ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${achieved ? 'bg-green-500 text-white' : isNext ? 'bg-orange-200 dark:bg-orange-800 text-orange-600 dark:text-orange-300' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                {achieved ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{tier.min}+</span>}
                              </div>
                              <div className="flex-1">
                                <span className={`font-medium ${achieved ? 'text-green-700 dark:text-green-400' : isNext ? 'text-orange-700 dark:text-orange-400' : 'text-stone-500 dark:text-stone-400'}`}>
                                  {tier.pct}% off
                                </span>
                                {isNext && <span className="text-xs text-orange-500 ml-2">— add {tier.min - count} more</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>

                  <div className="md:col-span-3">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Set Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-stone-600 dark:text-stone-400">
                            <span>Items ({count})</span>
                            <span className="font-semibold text-stone-900 dark:text-stone-100">${originalTotal.toFixed(2)}</span>
                          </div>
                          {discountPercent > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Bundle Discount ({discountPercent}%)</span>
                              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-stone-200 dark:border-stone-700 pt-3 flex justify-between text-xl font-bold">
                            <span className="text-stone-900 dark:text-stone-100">Total</span>
                            <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-3">
                        <motion.button
                          whileHover={count > 0 ? { scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' } : {}}
                          whileTap={count > 0 ? { scale: 0.98 } : {}}
                          onClick={addToCart}
                          disabled={count === 0}
                          className="btn-primary-glow w-full py-4 text-base justify-center"
                        >
                          <HiOutlineShoppingBag className="w-5 h-5" /> Finish Set — ${finalTotal.toFixed(2)}
                        </motion.button>
                        {nextTier && (
                          <p className="text-xs text-center text-stone-400">
                            Add {nextTier.min - count} more product{(nextTier.min - count) !== 1 ? 's' : ''} to unlock {nextTier.pct}% off
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== SEARCH VIEW ===== */}
        <AnimatePresence>
          {view === 'search' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={closeSearch}
              />
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Search Header */}
                <div className="flex items-center gap-3 p-4 border-b border-stone-100 dark:border-stone-800">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={closeSearch}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </motion.button>
                  <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
                    />
                  </div>
                  {category && (
                    <span className="text-[10px] font-medium text-purple-500 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md capitalize flex-shrink-0">
                      {category} only
                    </span>
                  )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4">
                  {searchQuery.trim() === '' ? (
                    <div className="text-center py-16">
                      <HiOutlineSearch className="w-12 h-12 text-stone-200 dark:text-stone-700 mx-auto mb-4" />
                      <p className="text-stone-400 text-sm">Type to search products</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-stone-400 text-sm">No products found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map(product => {
                        const blocked = category && product.category !== category;
                        return (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => !blocked && handleSelectProduct(product)}
                            disabled={blocked}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                              blocked
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                              <img src={product.image || 'https://placehold.co/100?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{product.name}</p>
                              <p className="text-[11px] text-stone-400 capitalize">{product.category}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">${Number(product.price).toFixed(2)}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
