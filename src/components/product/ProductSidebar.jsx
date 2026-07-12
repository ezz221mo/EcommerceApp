import { motion } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import { categories } from '../../data/products';

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

export default function ProductSidebar({
  selectedCat, setSelectedCat, setSearchParams,
  selectedBrand, setSelectedBrand,
  selectedPrice, setSelectedPrice,
  selectedRating, setSelectedRating,
  selectedSize, setSelectedSize,
  selectedColor, setSelectedColor,
  products, hasFilters, clearFilters,
  availableFilters,
}) {
  return (
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

      {/* Brand */}
      {availableFilters.brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-violet-500 rounded-full" />
            Brand
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <motion.button
              custom={0} variants={filterVariants} initial="hidden" animate="visible"
              onClick={() => setSelectedBrand('')}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                !selectedBrand
                  ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              All Brands
            </motion.button>
            {availableFilters.brands.map((brand, i) => (
              <motion.button
                key={brand}
                custom={i + 1}
                variants={filterVariants}
                initial="hidden" animate="visible"
                onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedBrand === brand
                    ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                {brand}
              </motion.button>
            ))}
          </div>
        </div>
      )}

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

      {/* Size */}
      {availableFilters.sizes.length > 0 && (
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-sky-500 rounded-full" />
            Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableFilters.sizes.map((size, i) => (
              <motion.button
                key={size}
                custom={i}
                variants={filterVariants}
                initial="hidden" animate="visible"
                onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedSize === size
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                }`}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {availableFilters.colors.length > 0 && (
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-pink-500 rounded-full" />
            Color
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {availableFilters.colors.map((c, i) => (
              <motion.button
                key={c.hex}
                custom={i}
                variants={filterVariants}
                initial="hidden" animate="visible"
                onClick={() => setSelectedColor(selectedColor === c.hex ? '' : c.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === c.hex
                    ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

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
}
