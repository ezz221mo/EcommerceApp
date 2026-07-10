import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiPlus, HiMinus, HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

export default function CartPage() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, clearCart, totalItems } = useCartStore();
  const navigate = useNavigate();

  const handleRemove = (item) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`, {
      icon: '\u{1F5D1}\uFE0F',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
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



        {/* Checkout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <Link to="/products" className="btn-ghost text-sm">
            Continue Shopping
          </Link>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className="btn-primary-glow w-full sm:w-auto text-base py-4 px-10 justify-center"
          >
            Proceed to Checkout <HiArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
