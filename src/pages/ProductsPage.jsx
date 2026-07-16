import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch, HiOutlineX, HiOutlineFilter, HiOutlineChevronDown,
} from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import RecentlyViewed from '../components/product/RecentlyViewed';
import { useProductStore, useCategoryStore } from '../store';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const sortOptions = [
  { value: 'newest',       label: 'Newest' },
  { value: 'oldest',       label: 'Oldest' },
  { value: 'price-asc',    label: 'Price: Low to High' },
  { value: 'price-desc',   label: 'Price: High to Low' },
  { value: 'rating',       label: 'Highest Rated' },
];

const dateFilters = [
  { value: '',      label: 'All Time' },
  { value: 'today',  label: 'Today' },
  { value: '7d',     label: 'Last 7 Days' },
  { value: '30d',    label: 'Last Month' },
  { value: '180d',   label: 'Last 6 Months' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [selectedSub, setSelectedSub] = useState(searchParams.get('sub') || '');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const products = useProductStore(s => s.products);
  const { categories: categoryStore } = useCategoryStore();
  const { items: recentItems, clearAll: clearRecent } = useRecentlyViewed();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const availableCategories = useMemo(() => {
    const catSlugs = new Set(products.map(p => p.category).filter(Boolean));
    return categoryStore.filter(c => catSlugs.has(c.slug));
  }, [products, categoryStore]);

  const availableSubs = useMemo(() => {
    if (!selectedCat) return [];
    const subs = new Set(
      products
        .filter(p => p.category === selectedCat && p.subcategory)
        .map(p => p.subcategory)
    );
    const catEntry = categoryStore.find(c => c.slug === selectedCat);
    return (catEntry?.subcategories || []).filter(s => subs.has(s.slug));
  }, [products, selectedCat, categoryStore]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCat)
      result = result.filter(p => p.category === selectedCat);

    if (selectedSub)
      result = result.filter(p => p.subcategory === selectedSub);

    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) result = result.filter(p => p.price >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) result = result.filter(p => p.price <= max);
    }

    if (dateFilter) {
      const now = Date.now();
      const ms = {
        today: 864e5,
        '7d': 7 * 864e5,
        '30d': 30 * 864e5,
        '180d': 180 * 864e5,
      }[dateFilter];
      if (ms) {
        const cutoff = now - ms;
        result = result.filter(p => {
          const t = new Date(p.createdAt || 0).getTime();
          return t >= cutoff;
        });
      }
    }

    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest':     result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      case 'oldest':     result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)); break;
    }

    return result;
  }, [products, search, selectedCat, selectedSub, priceMin, priceMax, dateFilter, sort]);

  const clearFilters = useCallback(() => {
    setSelectedCat('');
    setSelectedSub('');
    setPriceMin('');
    setPriceMax('');
    setDateFilter('');
    setSearch('');
    setSearchParams({});
  }, []);

  const hasFilters = selectedCat || selectedSub || priceMin || priceMax || dateFilter || search;

  const activeCatName = selectedCat
    ? categoryStore.find(c => c.slug === selectedCat)?.name || selectedCat
    : 'All Products';

  const currentSubs = availableSubs;

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            {activeCatName}
            {selectedSub && (
              <span className="text-stone-400 dark:text-stone-500 text-2xl ml-2">
                / {currentSubs.find(s => s.slug === selectedSub)?.name || selectedSub}
              </span>
            )}
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
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, category, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-12 pr-10"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="input-field w-auto cursor-pointer pr-8"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(v => !v)}
              className={`btn-secondary flex items-center gap-2 px-4 transition-all ${
                hasFilters ? 'border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-950/20' : ''
              }`}
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filters
              {hasFilters && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-orange-500 rounded-full" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="card p-5 space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  {/* Category */}
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                    <select value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setSelectedSub(''); }}
                      className="input-field w-full"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Subcategory */}
                  {currentSubs.length > 0 && (
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs font-medium text-stone-500 mb-1">Subcategory</label>
                      <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">All Subcategories</option>
                        {currentSubs.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Price Min */}
                  <div className="w-28">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Min Price</label>
                    <input type="number" placeholder="$0" value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>

                  {/* Price Max */}
                  <div className="w-28">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Max Price</label>
                    <input type="number" placeholder="$999" value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Added</label>
                    <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                      className="input-field w-full"
                    >
                      {dateFilters.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <button onClick={clearFilters}
                      className="btn-ghost text-sm text-rose-500 hover:text-rose-600 px-3 py-2 whitespace-nowrap"
                    >
                      <HiOutlineX className="w-4 h-4 inline mr-1" /> Clear all
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">{'\u{1F50D}'}</div>
            <h3 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              No products found
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <RecentlyViewed items={recentItems} onClear={clearRecent} />
    </div>
  );
}
