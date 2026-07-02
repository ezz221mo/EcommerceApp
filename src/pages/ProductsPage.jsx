import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineSearch, HiOutlineFilter, HiOutlineCheck } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import RecentlyViewed from '../components/product/RecentlyViewed';
import { categories } from '../data/products';
import { useProductStore } from '../store';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const sortOptions = [
  { value: 'newest',       label: 'Newest'              },
  { value: 'oldest',       label: 'Oldest'              },
  { value: 'price-asc',    label: 'Price: Low to High'  },
  { value: 'price-desc',   label: 'Price: High to Low'  },
  { value: 'rating',       label: 'Highest Rated'       },
  { value: 'best-selling', label: 'Best Selling'        },
];

const priceRanges = [
  { label: 'Under $50',    min: 0,   max: 50       },
  { label: '$50 - $100',   min: 50,  max: 100      },
  { label: '$100 - $200',  min: 100, max: 200      },
  { label: 'Over $200',    min: 200, max: Infinity  },
];

const filterVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, type: 'spring', stiffness: 100, damping: 15 } }),
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading,        setLoading]        = useState(true);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [search,         setSearch]         = useState(searchParams.get('search') || '');
  const [selectedCat,    setSelectedCat]    = useState(searchParams.get('cat')    || '');
  const [selectedPrice,  setSelectedPrice]  = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sort,           setSort]           = useState('featured');

  const products = useProductStore(s => s.products);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setSelectedCat(searchParams.get('cat')    || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search)
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
      );

    if (selectedCat)
      result = result.filter(p => p.category === selectedCat);

    if (selectedPrice)
      result = result.filter(p => p.price >= selectedPrice.min && p.price < selectedPrice.max);

    if (selectedRating > 0)
      result = result.filter(p => p.rating >= selectedRating);

    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price);   break;
      case 'price-desc': result.sort((a, b) => b.price - a.price);   break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     result.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0));    break;
    }

    return result;
  }, [products, search, selectedCat, selectedPrice, selectedRating, sort]);

  const clearFilters = () => {
    setSelectedCat('');
    setSelectedPrice(null);
    setSelectedRating(0);
    setSearch('');
    setSearchParams({});
  };

  const hasFilters = selectedCat || selectedPrice || selectedRating || search;

  const Sidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-orange-500 rounded-full" />
          Categories
        </h3>
        <div className="space-y-1">
          {[
            { id: '', label: 'All Products', icon: null, count: products.length },
            ...categories.map(cat => ({
              id: cat.id,
              label: cat.name,
              icon: cat.icon,
              count: products.filter(p => p.category === cat.id).length,
            })),
          ].map((cat, i) => {
            const isActive = selectedCat === cat.id;
            return (
              <motion.button
                key={cat.id || 'all'}
                custom={i}
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  setSelectedCat(cat.id);
                  setSearchParams(cat.id ? { cat: cat.id } : {});
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat.icon && <span className="text-base">{cat.icon}</span>}
                  {cat.label}
                </span>
                <span className={`text-xs ${isActive ? 'text-orange-400' : 'text-stone-400'}`}>{cat.count}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-teal-500 rounded-full" />
          Price Range
        </h3>
        <div className="space-y-1">
          {priceRanges.map((range, i) => (
            <motion.button
              key={range.label}
              custom={i}
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              onClick={() => setSelectedPrice(
                selectedPrice?.label === range.label ? null : range
              )}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                selectedPrice?.label === range.label
                  ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-500 rounded-full" />
          Min Rating
        </h3>
        <div className="space-y-1">
          {[
            { val: 0, label: 'All Ratings' },
            { val: 4.5, label: '4.5+' },
            { val: 4.0, label: '4.0+' },
            { val: 3.5, label: '3.5+' },
          ].map((r, i) => (
            <motion.button
              key={r.val}
              custom={i}
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              onClick={() => setSelectedRating(r.val)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                selectedRating === r.val
                  ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              {r.label === 'All Ratings' ? r.label : `${r.label} \u2B50`}
            </motion.button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={clearFilters}
          className="w-full btn-secondary text-sm py-2.5"
        >
          <HiOutlineX className="w-4 h-4" /> Clear All Filters
        </motion.button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            {selectedCat
              ? categories.find(c => c.id === selectedCat)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </motion.div>

        {/* Search + Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input-field w-auto cursor-pointer appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2378716c' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              }}
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-secondary flex items-center gap-2 px-4"
            >
              <HiOutlineAdjustments className="w-5 h-5" />
              Filters {hasFilters && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-orange-500 rounded-full" />}
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="card p-6 sticky top-24">
              <Sidebar />
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-5xl mb-4"
                >
                  {'\u{1F50D}'}
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  No products found
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-stone-900 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <HiOutlineFilter className="w-5 h-5 text-orange-500" />
                  Filters
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="btn-ghost p-2"
                >
                  <HiOutlineX className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6">
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
