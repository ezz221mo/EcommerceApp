import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiPlus, HiMinus, HiOutlineShoppingBag, HiArrowRight, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineTruck, HiOutlineTag } from 'react-icons/hi';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

const VALID_COUPONS = {
  SAVE10: { percent: 10, description: '10% off your order' },
  WELCOME20: { percent: 20, description: '20% off for new customers' },
  FREESHIP: { percent: 15, description: '15% off sitewide' },
};

export default function CartPage() {
  const [couponInput, setCouponInput] = useState('');
  const { items, removeItem, increaseQuantity, decreaseQuantity, clearCart, coupon, applyDiscount, removeDiscount, totalItems, totalPrice: subtotal, discount, grandTotal } = useCartStore();
  const navigate   = useNavigate();
  const shipping   = subtotal >= 75 ? 0 : 9.99;
  const tax        = subtotal * 0.08;
  const total      = grandTotal + shipping + tax;

  const handleRemove = (item) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`, {
      icon: '\u{1F5D1}\uFE0F',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const valid = VALID_COUPONS[code];
    if (valid) {
      applyDiscount({ code, percent: valid.percent });
      toast.success(`Coupon "${code}" applied! ${valid.description}`, {
        icon: '\u{1F3AF}',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    } else {
      toast.error('Invalid coupon code', {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="text-center py-20 px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <HiOutlineShoppingBag className="w-12 h-12 text-orange-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3"
          >
            Your cart is empty
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 mb-8"
          >
            Looks like you haven&apos;t added anything yet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link to="/products" className="btn-primary-glow text-base px-8 py-4">
              Start Shopping <HiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">Shopping Cart</h1>
            <p className="text-stone-500 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { clearCart(); toast.success('Cart cleared', { icon: '\u{1F5D1}\uFE0F', style: { borderRadius: '12px' } }); }}
            className="text-sm text-stone-400 hover:text-rose-500 transition-colors px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            Clear all items
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -80, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="card p-4 sm:p-6 hover:shadow-lg hover:shadow-stone-200/40 dark:hover:shadow-stone-900/40 transition-shadow"
                >
                  <div className="flex gap-4 sm:gap-5">
                    <Link to={`/products/${item.id}`} className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group">
                      <motion.img
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1 capitalize">{item.category}</p>
                          <Link to={`/products/${item.id}`}>
                            <h3 className="font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-600 transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-lg text-stone-900 dark:text-stone-100">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-stone-400">${item.price} each</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                          >
                            <HiMinus className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="w-8 text-center font-semibold"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => increaseQuantity(item.id)}
                            className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                          >
                            <HiPlus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-500 transition-colors group"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.1 }}
              className="sticky top-24"
            >
              <div className="card-glass p-6 space-y-6">
                <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  {coupon && discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-green-600 dark:text-green-400 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <HiOutlineTag className="w-3.5 h-3.5" />
                        Discount ({coupon.code})
                      </span>
                      <span>-${discount.toFixed(2)}</span>
                    </motion.div>
                  )}

                  {shipping > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <HiOutlineTruck className="w-3.5 h-3.5 flex-shrink-0" />
                      Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className="pt-3 border-t border-stone-100 dark:border-stone-800"
                  >
                    <div className="flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Coupon */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Coupon code"
                    className="input-field text-sm flex-1"
                  />
                  {coupon ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { removeDiscount(); setCouponInput(''); toast('Discount removed', { icon: '\u{1F5D1}\uFE0F', style: { borderRadius: '12px' } }); }}
                      className="btn-secondary text-sm px-4 whitespace-nowrap border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                    >
                      Remove
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApplyCoupon}
                      className="btn-secondary text-sm px-4 whitespace-nowrap"
                    >
                      Apply
                    </motion.button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="btn-primary-glow w-full text-base py-4 justify-center"
                >
                  Proceed to Checkout <HiArrowRight className="w-5 h-5" />
                </motion.button>

                <Link to="/products" className="btn-ghost w-full justify-center text-sm">
                  Continue Shopping
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="flex items-center gap-1"><HiOutlineShieldCheck className="w-3.5 h-3.5" /> Secure</span>
                  <span className="text-stone-300 dark:text-stone-600">|</span>
                  <span className="flex items-center gap-1"><HiOutlineRefresh className="w-3.5 h-3.5" /> Easy returns</span>
                  <span className="text-stone-300 dark:text-stone-600">|</span>
                  <span className="flex items-center gap-1"><HiOutlineTruck className="w-3.5 h-3.5" /> Free shipping*</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
