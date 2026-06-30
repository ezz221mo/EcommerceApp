import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import { categories } from '../data/products';
import { useProductStore } from '../store';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest',   label: 'Newest'   },
  { value: 'price-asc',  label: 'Price: Low to High'  },
  { value: 'price-desc', label: 'Price: High to Low'  },
  { value: 'rating',   label: 'Top Rated' },
];

const priceRanges = [
  { label: 'Under $50',    min: 0,   max: 50       },
  { label: '$50 - $100',   min: 50,  max: 100      },
  { label: '$100 - $200',  min: 100, max: 200      },
  { label: 'Over $200',    min: 200, max: Infinity  },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading,        setLoading]        = useState(true);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [search,         setSearch]         = useState(searchParams.get('search') || '');
  const [selectedCat,    setSelectedCat]    = useState(searchParams.get('cat')    || '');
  const [selectedPrice,  setSelectedPrice]  = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sort,           setSort]           = useState('featured');

  // ── قراءة المنتجات من الـ Store مباشرةً (يشمل المضافة من الداشبورد) ──
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

  // ── Sidebar content (مشترك بين desktop و mobile) ──────────────────────────
  const Sidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => { setSelectedCat(''); setSearchParams({}); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={!selectedCat
              ? { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 600 }
              : { color: '#1c1917' }
            }
          >
            All Products ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(cat.id); setSearchParams({ cat: cat.id }); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between cursor-pointer"
                style={isActive
                  ? { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 600 }
                  : { color: '#1c1917' }
                }
              >
                <span>{cat.icon} {cat.name}</span>
                <span className="text-xs" style={{ color: '#71717a' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Price Range</h3>
        <div className="space-y-1">
          {priceRanges.map(range => (
            <button
              key={range.label}
              onClick={() => setSelectedPrice(
                selectedPrice?.label === range.label ? null : range
              )}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedPrice?.label === range.label
                  ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Min Rating</h3>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5, 0].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRating(r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedRating === r
                  ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {r === 0 ? 'All Ratings' : `${r}+ ⭐`}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full btn-secondary text-sm py-2">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            {selectedCat
              ? categories.find(c => c.id === selectedCat)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              className="input-field w-auto cursor-pointer"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-secondary flex items-center gap-2 px-4"
            >
              <HiOutlineAdjustments className="w-5 h-5" />
              Filters {hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <Sidebar />
            </div>
          </aside>

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
                <div className="text-6xl mb-4">🔍</div>
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
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-stone-900 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
                  Filters
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-2">
                  <HiOutlineX className="w-5 h-5" />
                </button>
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