import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineX, HiStar, HiOutlineShoppingCart, HiHeart, HiOutlineHeart,
  HiPlus, HiMinus, HiOutlineScale,
} from 'react-icons/hi';
import { useCartStore, useWishlistStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import useCompare from '../../hooks/useCompare';
import toast from 'react-hot-toast';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
  exit: {
    opacity: 0, scale: 0.95, y: 10,
    transition: { duration: 0.15 },
  },
};

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem, isInCart }  = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { addItem: addCompare, isCompared } = useCompare();
  const { userData }           = useAuth();

  const isSeller   = userData?.role === 'seller';
  const inCart     = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const compared   = isCompared(product.id);

  const maxStock = product.stock ? parseInt(product.stock) : Infinity;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!product.inStock || isSeller) return;
    addItem(product, quantity, false);
    toast.success(`${quantity}× ${product.name} added to cart!`, {
      icon: '\u{1F6D2}',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
    onClose();
  };

  const handleWishlist = () => {
    toggleItem(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '\u{1F494}' : '\u2764\uFE0F',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  const handleCompare = () => {
    addCompare(product);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-stone-700 transition-colors"
            >
              <HiOutlineX className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-square bg-stone-100 dark:bg-stone-800 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
                <img
                  src={product.image || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col justify-center">
                {product.brand && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">
                    {product.brand}
                  </p>
                )}

                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1 capitalize">
                  {product.category}
                </p>

                <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'
                      }`} />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-medium">{product.rating}</span>
                  <span className="text-xs text-stone-400">({(product.reviews || 0).toLocaleString()} reviews)</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-stone-400 text-base line-through">${product.originalPrice}</span>
                      {discount && (
                        <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-xs">
                          -{discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>

                {product.shortDescription && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4 line-clamp-3">
                    {product.shortDescription}
                  </p>
                )}

                {product.colors?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                      Color: <span className="text-stone-800 dark:text-stone-200">{product.colors[selectedColor]?.name}</span>
                    </p>
                    <div className="flex gap-2">
                      {product.colors.map((c, i) => (
                        <button
                          key={c.hex}
                          onClick={() => setSelectedColor(i)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor === i
                              ? 'border-orange-500 scale-110 shadow-md'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                      Size: <span className="text-stone-800 dark:text-stone-200">{product.sizes[selectedSize]}</span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map((s, i) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(i)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            selectedSize === i
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                              : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {!isSeller && product.inStock && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Quantity</p>
                    <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 rounded-xl p-1 w-fit">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                      >
                        <HiMinus className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity(q => Math.min(q + 1, maxStock))}
                        disabled={quantity >= maxStock}
                        className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        <HiPlus className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Compare button */}
                {!isSeller && (
                  <div className="mb-4">
                    <motion.button
                      onClick={handleCompare}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                        compared ? 'text-teal-500' : 'text-stone-400 hover:text-teal-500'
                      }`}
                    >
                      <HiOutlineScale className="w-3.5 h-3.5" />
                      {compared ? 'Comparing' : 'Compare'}
                    </motion.button>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isSeller && product.inStock && (
                    <button onClick={handleAddToCart}
                      className="btn-primary flex-1 text-sm py-3"
                    >
                      <HiOutlineShoppingCart className="w-4 h-4" />
                      {inCart ? 'In Cart' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
                    </button>
                  )}

                  {!isSeller && (
                    <button onClick={handleWishlist}
                      className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        wishlisted
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-stone-200 dark:border-stone-700 hover:border-rose-400'
                      }`}
                    >
                      {wishlisted
                        ? <HiHeart className="w-5 h-5 text-rose-500" />
                        : <HiOutlineHeart className="w-5 h-5 text-stone-500" />}
                    </button>
                  )}
                </div>

                <Link to={`/products/${product.id}`}
                  onClick={onClose}
                  className="mt-3 text-center text-sm text-stone-500 hover:text-orange-500 transition-colors underline underline-offset-2"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
