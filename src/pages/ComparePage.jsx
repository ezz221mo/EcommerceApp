import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineX, HiOutlineTrash, HiOutlineScale, HiStar, HiOutlineShoppingCart } from 'react-icons/hi';
import useCompare from '../hooks/useCompare';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const { addItem, isInCart } = useCartStore();

  const allFields = [
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'sizes', label: 'Sizes' },
    { key: 'colors', label: 'Colors' },
    { key: 'description', label: 'Description' },
    { key: 'inStock', label: 'Availability' },
    { key: 'actions', label: 'Actions' },
  ];

  const getValue = (product, field) => {
    switch (field) {
      case 'image':
        return (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mx-auto">
            <img src={product.image || 'https://placehold.co/200?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
          </div>
        );
      case 'name':
        return <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{product.name}</span>;
      case 'category':
        return <span className="text-sm capitalize text-stone-600 dark:text-stone-400">{product.category || '—'}</span>;
      case 'brand':
        return <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">{product.brand || '—'}</span>;
      case 'price':
        return (
          <div>
            <span className="font-bold text-lg text-stone-900 dark:text-stone-100">${product.price}</span>
            {product.originalPrice && (
              <span className="text-stone-400 text-sm line-through ml-2">${product.originalPrice}</span>
            )}
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center justify-center gap-1">
            <HiStar className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{product.rating || '—'}</span>
            {product.reviews > 0 && <span className="text-xs text-stone-400">({product.reviews})</span>}
          </div>
        );
      case 'sizes':
        return product.sizes?.length > 0
          ? <div className="flex flex-wrap gap-1 justify-center">{product.sizes.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-md text-stone-600 dark:text-stone-400 font-medium">{s}</span>)}</div>
          : <span className="text-sm text-stone-400">—</span>;
      case 'colors':
        return product.colors?.length > 0
          ? <div className="flex flex-wrap gap-1.5 justify-center">{product.colors.map(c => <span key={c.hex} className="w-5 h-5 rounded-full border border-stone-200 dark:border-stone-700" style={{ backgroundColor: c.hex }} title={c.name} />)}</div>
          : <span className="text-sm text-stone-400">—</span>;
      case 'description':
        return <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">{product.description || '—'}</p>;
      case 'inStock':
        return (
          <span className={`badge text-xs ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        );
      case 'actions':
        return (
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={() => { removeItem(product.id); toast('Removed from comparison', { icon: '\u{1F5D1}\uFE0F', style: { borderRadius: '12px' } }); }}
              className="text-stone-400 hover:text-rose-500 transition-colors p-1"
              title="Remove"
            >
              <HiOutlineX className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (isInCart(product.id)) {
                  toast('Already in cart', { icon: '\u{1F6D2}', style: { borderRadius: '12px' } });
                } else {
                  addItem(product, 1, false);
                  toast.success('Added to cart!', { style: { borderRadius: '12px' } });
                }
              }}
              disabled={!product.inStock}
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors disabled:opacity-30"
              title="Add to cart"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </motion.button>
          </div>
        );
      default:
        return '—';
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-center py-20 px-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <HiOutlineScale className="w-12 h-12 text-teal-400" />
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">No products to compare</h2>
          <p className="text-stone-500 mb-8">Add products from the shop to compare their features side by side.</p>
          <Link to="/products" className="btn-primary text-base px-8 py-4">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">Compare Products</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">{items.length} product{items.length !== 1 ? 's' : ''} selected</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearAll} className="btn-secondary text-sm">
            <HiOutlineTrash className="w-4 h-4" /> Clear All
          </motion.button>
        </motion.div>

        {/* Desktop Comparison Table */}
        <div className="hidden md:block">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            <table className="w-full">
              <tbody>
                {allFields.map((field, fi) => (
                  <motion.tr
                    key={field.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: fi * 0.03 }}
                    className={`${fi % 2 === 0 ? 'bg-stone-50/50 dark:bg-stone-800/20' : 'bg-white dark:bg-stone-900'} border-b border-stone-100 dark:border-stone-800 last:border-0`}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-stone-500 dark:text-stone-400 w-32 uppercase tracking-wider">
                      {field.label}
                    </td>
                    {items.map((product, pi) => {
                      const isDiff = fi > 1 && items.some((p, i) => i !== pi && String(p[field.key]) !== String(product[field.key]));
                      return (
                        <td key={product.id} className={`px-5 py-4 text-center ${isDiff ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''}`}>
                          {isDiff && field.key !== 'image' && field.key !== 'actions' && (
                            <div className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider mb-1">Different</div>
                          )}
                          {getValue(product, field.key)}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img src={product.image || 'https://placehold.co/200?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{product.name}</h3>
                    <p className="text-xs text-stone-400 capitalize mt-0.5">{product.category}</p>
                    <div className="font-bold text-orange-500 mt-1">${product.price}</div>
                  </div>
                </div>
                <button onClick={() => { removeItem(product.id); toast('Removed from comparison', { icon: '\u{1F5D1}\uFE0F', style: { borderRadius: '12px' } }); }}
                  className="text-stone-400 hover:text-rose-500 transition-colors p-1">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-stone-400">Brand</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100 mt-0.5">{product.brand || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Rating</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <HiStar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium text-stone-900 dark:text-stone-100">{product.rating || '—'}</span>
                  </div>
                </div>
                {product.sizes?.length > 0 && (
                  <div>
                    <p className="text-xs text-stone-400">Sizes</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {product.sizes.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-md text-stone-600 dark:text-stone-400 font-medium">{s}</span>)}
                    </div>
                  </div>
                )}
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-xs text-stone-400">Colors</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {product.colors.map(c => <span key={c.hex} className="w-4 h-4 rounded-full border border-stone-200 dark:border-stone-700" style={{ backgroundColor: c.hex }} title={c.name} />)}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-stone-400">Availability</p>
                  <span className={`badge text-xs mt-0.5 ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {product.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-stone-400">Description</p>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mt-0.5 line-clamp-2">{product.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isInCart(product.id)) {
                      toast('Already in cart', { icon: '\u{1F6D2}', style: { borderRadius: '12px' } });
                    } else {
                      addItem(product, 1, false);
                      toast.success('Added to cart!', { style: { borderRadius: '12px' } });
                    }
                  }}
                  disabled={!product.inStock}
                  className="btn-primary w-full py-2.5 text-sm justify-center"
                >
                  <HiOutlineShoppingCart className="w-4 h-4" /> Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <Link to="/products" className="btn-ghost text-sm">
            Browse more products to compare
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
