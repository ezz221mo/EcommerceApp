import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineHeart, HiHeart,
  HiOutlineShoppingCart, HiShoppingCart,
  HiStar, HiOutlineEye,
} from 'react-icons/hi';
import { useCartStore, useWishlistStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import QuickViewModal from './QuickViewModal';
import toast from 'react-hot-toast';

const ProductCard = memo(function ProductCard({ product, index = 0 }) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  const { addItem, isInCart }        = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { currentUser, userData, isStoreOwner }    = useAuth();

  const isSeller   = userData?.role === 'seller' || isStoreOwner;
  const inCart     = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleCartToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || isSeller || !currentUser) return;

    if (inCart) {
      addItem(product, 1, true);
      toast('Removed from cart', {
        icon: '\u{1F5D1}\uFE0F',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    } else {
      addItem(product, 1, false);
      toast.success(`${product.name} added to cart!`, {
        icon: '\u{1F6D2}',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '\u{1F494}' : '\u2764\uFE0F',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const lowStock = product.inStock && product.stock != null && Number(product.stock) > 0 && Number(product.stock) <= 10;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        whileHover={{ y: -4 }}
        className="group"
      >
        <Link to={`/products/${product.id}`} className="block">
          <div className="card overflow-hidden hover:shadow-xl hover:shadow-stone-200/60 dark:hover:shadow-stone-900/60 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-square">
              {!imgReady && (
                <div className="absolute inset-0 skeleton" />
              )}
              <img
                src={product.image || 'https://placehold.co/400x400?text=No+Image'}
                alt={product.name}
                onLoad={() => setImgReady(true)}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: imgReady ? 1 : 0 }}
                loading="lazy"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 + 0.1 }}
                    className={`badge text-white text-xs ${
                      product.badge === 'Sale'        ? 'bg-rose-500'  :
                      product.badge === 'New'         ? 'bg-teal-500'  :
                      product.badge === 'Best Seller' ? 'bg-amber-500' :
                      'bg-orange-500'
                    }`}
                  >
                    {product.badge === 'Sale' && discount ? `Sale -${discount}%` : product.badge}
                  </motion.span>
                )}
                {discount && !product.badge && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 + 0.15 }}
                    className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                  >
                    -{discount}%
                  </motion.span>
                )}
                {lowStock && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 + 0.2 }}
                    className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  >
                    Low Stock
                  </motion.span>
                )}
              </div>

              {/* Wishlist — always visible on mobile, hover-reveal on desktop */}
              {!isSeller && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 + 0.2 }}
                  className="absolute top-3 right-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200"
                >
                  <motion.button
                    onClick={handleWishlist}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 8 }}
                    className="w-8 h-8 bg-white dark:bg-stone-800 rounded-lg shadow flex items-center justify-center"
                  >
                    {wishlisted
                      ? <HiHeart className="w-4 h-4 text-rose-500" />
                      : <HiOutlineHeart className="w-4 h-4 text-stone-600" />}
                  </motion.button>
                </motion.div>
              )}

              {/* Quick View — on hover */}
              {!isSeller && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-0 bottom-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-4"
                >
                  <motion.button
                    onClick={handleQuickView}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm text-stone-900 dark:text-stone-100 text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5"
                  >
                    <HiOutlineEye className="w-3.5 h-3.5" />
                    Quick View
                  </motion.button>
                </motion.div>
              )}

              {/* In-cart badge */}
              {inCart && !isSeller && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-3 left-3"
                >
                  <span className="badge bg-orange-500 text-white text-xs">In Cart</span>
                </motion.div>
              )}

              {/* Out of stock overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 text-stone-900 text-sm font-semibold px-3 py-1 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1 capitalize">
              {product.category}
            </p>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 + i * 0.03 }}
                  >
                    <HiStar className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'
                    }`} />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {product.rating || 0} ({(product.reviews || 0).toLocaleString()})
              </span>
            </div>

            {/* Price + Cart toggle (hidden for sellers) */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-stone-400 text-sm line-through ml-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {currentUser && !isSeller && (
                <motion.button
                  onClick={handleCartToggle}
                  disabled={!product.inStock}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 8 }}
                  title={inCart ? 'Remove from cart' : 'Add to cart'}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white
                              transition-all duration-200
                              shadow-lg disabled:shadow-none
                              ${inCart
                                ? 'bg-stone-700 hover:bg-rose-600 shadow-stone-700/25'
                                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/25'
                              }
                              disabled:bg-stone-200 dark:disabled:bg-stone-700`}
                >
                  {inCart
                    ? <HiShoppingCart    className="w-4 h-4" />
                    : <HiOutlineShoppingCart className="w-4 h-4" />}
                </motion.button>
              )}
            </div>
          </div>
          </div>
        </Link>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </motion.div>
    </>
  );
});

export default ProductCard;
