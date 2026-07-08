import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineTrash } from 'react-icons/hi';

const spring = { type: 'spring', stiffness: 80, damping: 13 };

export default function RecentlyViewed({ items, onClear }) {
  if (!items?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-12"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-stone-400" />
          Recently Viewed
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClear}
          className="text-xs text-stone-400 hover:text-rose-500 transition-colors flex items-center gap-1"
        >
          <HiOutlineTrash className="w-3.5 h-3.5" />
          Clear
        </motion.button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
        {items.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: i * 0.025 }}
            className="flex-shrink-0"
          >
            <Link
              to={`/products/${product.id}`}
              className="block w-28 sm:w-32 group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-2">
                <img
                  src={product.image || 'https://placehold.co/200?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-orange-600 transition-colors">
                {product.name}
              </p>
              <p className="text-xs font-bold text-orange-500">${product.price}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
