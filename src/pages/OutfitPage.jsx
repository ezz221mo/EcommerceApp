import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineRefresh } from 'react-icons/hi';
import useOutfit from '../hooks/useOutfit';
import { useProductStore } from '../store';

const SLOTS = [
  { key: 'top', label: 'Top', icon: '\u{1F455}', placeholder: 'Select a top' },
  { key: 'bottom', label: 'Bottom', icon: '\u{1F456}', placeholder: 'Select bottoms' },
  { key: 'shoes', label: 'Shoes', icon: '\u{1F45F}', placeholder: 'Select shoes' },
  { key: 'accessory', label: 'Accessory', icon: '\u{1F48D}', placeholder: 'Optional' },
];

const spring = { type: 'spring', stiffness: 200, damping: 20 };

export default function OutfitPage() {
  const { outfit, selectItem, removeItem, clearOutfit, addToCart, totalPrice, filledCount } = useOutfit();
  const products = useProductStore(s => s.products);
  const fashionProducts = useMemo(() => products.filter(p => p.category === 'fashion' || p.category === 'Fashion'), [products]);

  const [activeSlot, setActiveSlot] = useState(null);

  const handleSelectProduct = (slot, product) => {
    selectItem(slot, product);
    setActiveSlot(null);
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">Build Your Outfit</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">Mix and match fashion items to create the perfect look</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearOutfit} className="btn-secondary text-sm">
              <HiOutlineRefresh className="w-4 h-4" /> Clear
            </motion.button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Slot Selectors */}
          <div className="lg:col-span-2 space-y-4">
            {SLOTS.map((slot, i) => {
              const selected = outfit[slot.key];
              return (
                <motion.div
                  key={slot.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`card overflow-hidden transition-all duration-300 ${activeSlot === slot.key ? 'ring-2 ring-orange-500/50 shadow-lg' : ''}`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{slot.icon}</span>
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{slot.label}</h3>
                        {slot.key === 'accessory' && <span className="text-xs text-stone-400 font-medium">(Optional)</span>}
                      </div>
                      {selected && (
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(slot.key)}
                          className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <HiOutlineX className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                          <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">{selected.name}</p>
                          <p className="text-orange-500 font-bold mt-0.5">${selected.price}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveSlot(activeSlot === slot.key ? null : slot.key)}
                          className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
                        >
                          Replace
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={() => setActiveSlot(activeSlot === slot.key ? null : slot.key)}
                        className="w-full border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl py-6 text-center text-stone-400 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-500 transition-all"
                      >
                        <p className="font-medium text-sm">{slot.placeholder}</p>
                        <p className="text-xs mt-1">Click to browse fashion products</p>
                      </motion.button>
                    )}
                  </div>

                  {/* Product picker */}
                  <AnimatePresence>
                    {activeSlot === slot.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-stone-100 dark:border-stone-800 overflow-hidden"
                      >
                        <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                          {fashionProducts.length === 0 ? (
                            <p className="text-stone-400 text-sm text-center py-4">No fashion products available. Add some via the seller dashboard.</p>
                          ) : (
                            fashionProducts.map((product, idx) => (
                              <motion.button
                                key={product.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.025 }}
                                onClick={() => handleSelectProduct(slot.key, product)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{product.name}</p>
                                  <p className="text-xs text-stone-400">${product.price}</p>
                                </div>
                                {outfit[slot.key]?.id === product.id && (
                                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">Selected</span>
                                )}
                              </motion.button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Outfit Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24"
            >
              <div className="card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <HiOutlineSparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Your Outfit</h2>
                </div>

                {/* Preview */}
                <div className="space-y-3">
                  {SLOTS.map(slot => {
                    const selected = outfit[slot.key];
                    return (
                      <div key={slot.key} className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${selected ? 'bg-stone-100 dark:bg-stone-800' : 'bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700'}`}>
                          {selected ? (
                            <img src={selected.image} alt={selected.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-sm opacity-40">{slot.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-400">{slot.label}</p>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                            {selected ? selected.name : 'Not selected'}
                          </p>
                        </div>
                        {selected && (
                          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">${selected.price}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-600 dark:text-stone-400">Items</span>
                    <span className="text-stone-900 dark:text-stone-100 font-semibold">{filledCount}/4</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-bold text-stone-900 dark:text-stone-100">Total</span>
                    <span className="font-bold text-orange-500 text-xl">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={filledCount > 0 ? { scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' } : {}}
                  whileTap={filledCount > 0 ? { scale: 0.98 } : {}}
                  onClick={addToCart}
                  disabled={filledCount === 0}
                  className="btn-primary-glow w-full py-4 text-base justify-center"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" /> Add Entire Outfit to Cart
                </motion.button>

                {filledCount === 0 && (
                  <p className="text-xs text-center text-stone-400">Select items above to build your outfit</p>
                )}

                <Link to="/products" className="btn-ghost w-full justify-center text-sm">
                  Browse All Products
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
