import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiPlus, HiMinus, HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const navigate   = useNavigate();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping   = subtotal >= 75 ? 0 : 9.99;
  const tax        = subtotal * 0.08;
  const total      = subtotal + shipping + tax;

  const handleRemove = (item) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`, {
      icon: '🗑️',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineShoppingBag className="w-12 h-12 text-stone-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            Your cart is empty
          </h2>
          <p className="text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary text-base px-8 py-4">
            Start Shopping <HiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">
            Shopping Cart
          </h1>
          <span className="text-stone-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card p-4 sm:p-6"
                >
                  <div className="flex gap-4">
                    <Link to={`/products/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1 capitalize">{item.category}</p>
                          <Link to={`/products/${item.id}`}>
                            <h3 className="font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-600 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-lg text-stone-900 dark:text-stone-100">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-stone-400">${item.price} each</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                          >
                            <HiMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                          >
                            <HiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-500 transition-colors group"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { clearCart(); toast.success('Cart cleared', { icon: '🗑️', style: { borderRadius: '12px' } }); }}
                className="text-sm text-stone-400 hover:text-rose-500 transition-colors"
              >
                Clear all items
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 sticky top-24"
            >
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
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
                {shipping > 0 && (
                  <div className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2">
                    Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="Coupon code" className="input-field text-sm" />
                <button className="btn-secondary text-sm px-4 whitespace-nowrap">Apply</button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full text-base py-4"
              >
                Proceed to Checkout <HiArrowRight className="w-5 h-5" />
              </motion.button>

              <Link to="/products" className="btn-ghost w-full mt-3 justify-center text-sm">
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-400">
                <span>🔒 Secure</span>
                <span>•</span>
                <span>💳 All cards accepted</span>
                <span>•</span>
                <span>↩️ Easy returns</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}