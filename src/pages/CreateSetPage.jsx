import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import useCreateSet from '../hooks/useCreateSet';
import { useProductStore } from '../store';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

export default function CreateSetPage() {
  const { sets, loaded, createNewSet, deleteSet } = useCreateSet();
  const allProducts = useProductStore(s => s.products);
  const navigate = useNavigate();

  const handleCreateNew = () => {
    const newId = createNewSet();
    navigate(`/create-set/${newId}`); // توجيه فوري للصفحة الجديدة
  };

  if (!loaded) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">Create Your Set</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your custom bundles</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="btn-primary text-sm"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create New Set
          </motion.button>
        </motion.div>

        {sets.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-center py-20">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <HiOutlineSparkles className="w-12 h-12 text-purple-400" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">No sets yet</h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">Create your first set to start building a custom bundle and unlock tiered discounts.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleCreateNew}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl shadow-orange-500/25 transition-shadow"
            >
              <HiOutlinePlus className="w-7 h-7" />
              Create Your First Set
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sets.map((s, idx) => {
              // On-the-fly resolution لحساب المجموع بدون أخطاء ريفرش
              const setProducts = s.productIds.map(id => allProducts.find(p => String(p.id) === String(id))).filter(Boolean);
              const total = setProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/create-set/${s.id}`)}
                  className="card p-5 cursor-pointer group relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <HiOutlineSparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 capitalize">
                        {s.category || 'Uncategorized'}
                      </span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteSet(s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-rose-500 transition-all"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">${total.toFixed(2)}</p>
                    <p className="text-sm text-stone-500">{setProducts.length} product{setProducts.length !== 1 ? 's' : ''}</p>
                  </div>
                  {setProducts.length > 0 && (
                    <div className="mt-3 flex -space-x-2">
                      {setProducts.slice(0, 4).map(p => (
                        <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-stone-800 overflow-hidden bg-stone-100">
                          {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                      {setProducts.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-500">
                          +{setProducts.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}