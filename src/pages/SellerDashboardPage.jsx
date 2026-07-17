import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineViewGrid, HiOutlineShoppingBag,
  HiOutlineChartBar, HiOutlineCurrencyDollar,
  HiOutlineTrash, HiOutlineEye, HiOutlineX, HiOutlinePhotograph,
  HiOutlineUpload, HiOutlineTag, HiOutlinePencil, HiOutlineCollection,
  HiOutlineBookmarkAlt, HiOutlineChevronDown,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { useProductStore, useOrderStore, useCategoryStore } from '../store';
import {
  getCouponsBySeller,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../services/couponService';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import toast from 'react-hot-toast';

// ─── Add Product Modal (with multi-image + dynamic categories) ───────────────
function AddProductModal({ onClose }) {
  const addProduct = useProductStore(s => s.addProduct);
  const { userData } = useAuth();
  const { categories: allCategories, fetchCategories } = useCategoryStore();
  const fileRef    = useRef(null);

  const [form, setForm] = useState({
    name: '', price: '', category: '', subcategory: '',
    stock: '', description: '', features: '',
    originGovernorate: 'Cairo',
    sameGovernorateDelivery: '1-2 days',
    otherGovernoratesDelivery: '5-7 days',
  });
  const [imageFiles,    setImageFiles]    = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const selectedCatObj = allCategories.find(c => c.slug === form.category);
  const subcategories = selectedCatObj?.subcategories || [];

  // ── Convert selected files → base64 data URLs ────────────────────────────
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not a valid image`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} must be smaller than 5 MB`); return false; }
      return true;
    });
    if (valid.length === 0) return;

    Promise.all(valid.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then(results => {
      setImageFiles(prev => [...prev, ...valid]);
      setImagePreviews(prev => [...prev, ...results]);
    });
  };

  const handleRemoveImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error('Please fill Name and Price', { style: { borderRadius: '12px' } });
      return;
    }
    if (imagePreviews.length === 0) {
      toast.error('Please upload at least one product image', { style: { borderRadius: '12px' } });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    await addProduct({
      ...form,
      image:       imagePreviews[0] || '',
      images:      imagePreviews,
      sellerEmail: userData?.email,
      features: form.features
        ? form.features.split(',').map(f => f.trim()).filter(Boolean)
        : [],
      shipping: {
        originGovernorate: form.originGovernorate,
        sameGovernorateDelivery: form.sameGovernorateDelivery,
        otherGovernoratesDelivery: form.otherGovernoratesDelivery,
      },
    });

    toast.success('Product added successfully!', {
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{ scale: 0.95,    opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Add New Product
          </h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Image Upload ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Product Images <span className="text-rose-500">*</span>
            </label>

            {/* Preview grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                        Thumbnail
                      </span>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-orange-400 flex items-center justify-center transition-colors bg-stone-50 dark:bg-stone-800/30"
                  >
                    <HiOutlinePlus className="w-5 h-5 text-stone-400" />
                  </button>
                )}
              </div>
            )}

            {imagePreviews.length === 0 ? (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-orange-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group bg-stone-50 dark:bg-stone-800/30"
              >
                <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 flex items-center justify-center transition-colors">
                  <HiOutlineUpload className="w-5 h-5 text-stone-400 group-hover:text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 group-hover:text-orange-600 transition-colors">
                  Click to upload images
                </p>
                <p className="text-xs text-stone-400">PNG, JPG, WEBP · Max 5 MB each · Up to 5 images</p>
              </button>
            ) : null}

            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImagesChange} />
          </div>

          {/* ── Name ──────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Wireless Earbuds Pro" className="input-field" />
          </div>

          {/* ── Price + Stock ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Stock
              </label>
              <input type="number" min="0" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="0" className="input-field" />
            </div>
          </div>

          {/* ── Category ──────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            {allCategories.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium mb-1">No categories yet</p>
                <p>Go to the <span className="font-semibold">Categories</span> tab to create one before adding products.</p>
              </div>
            ) : (
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                className="input-field cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {allCategories.map(c => (
                  <option key={c.id} value={c.slug} className="bg-white dark:bg-stone-800">
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Subcategory ────────────────────────────────────────────────── */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Subcategory
              </label>
              <select value={form.subcategory}
                onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                className="input-field cursor-pointer"
              >
                <option value="">Select subcategory</option>
                {subcategories.map(s => (
                  <option key={s.slug} value={s.slug} className="bg-white dark:bg-stone-800">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Description ───────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Description
            </label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short product description…" className="input-field resize-none" />
          </div>

          {/* ── Features ──────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Features <span className="text-stone-400 font-normal">(comma-separated)</span>
            </label>
            <input type="text" value={form.features}
              onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              placeholder="Wireless, Fast charging, Waterproof" className="input-field" />
          </div>

          {/* ── Shipping Information ──────────────────────────────────────── */}
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
              Shipping Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Origin Governorate
                </label>
                <input type="text" value={form.originGovernorate}
                  onChange={e => setForm(f => ({ ...f, originGovernorate: e.target.value }))}
                  placeholder="e.g. Cairo" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Delivery Time (Same Governorate)
                </label>
                <input type="text" value={form.sameGovernorateDelivery}
                  onChange={e => setForm(f => ({ ...f, sameGovernorateDelivery: e.target.value }))}
                  placeholder="e.g. 1-2 days" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Delivery Time (Other Governorates)
                </label>
                <input type="text" value={form.otherGovernoratesDelivery}
                  onChange={e => setForm(f => ({ ...f, otherGovernoratesDelivery: e.target.value }))}
                  placeholder="e.g. 5-7 days" className="input-field" />
              </div>
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg> Adding…</>
              ) : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Categories Manager ──────────────────────────────────────────────────────
function CategoriesManager() {
  const { categories, fetchCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', subInput: '' });
  const [subItems, setSubItems] = useState([]);

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setEditingCat(null);
    setCatForm({ name: '', subInput: '' });
    setSubItems([]);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, subInput: '' });
    setSubItems(cat.subcategories || []);
  };

  const addSubItem = () => {
    const name = catForm.subInput.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (subItems.some(s => s.slug === slug)) {
      toast.error('Subcategory already exists', { style: { borderRadius: '12px' } });
      return;
    }
    setSubItems(prev => [...prev, { name, slug }]);
    setCatForm(f => ({ ...f, subInput: '' }));
  };

  const removeSubItem = (slug) => {
    setSubItems(prev => prev.filter(s => s.slug !== slug));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      toast.error('Category name is required', { style: { borderRadius: '12px' } });
      return;
    }
    setLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, { name: catForm.name, subcategories: subItems });
        toast.success('Category updated!', { style: { borderRadius: '12px' } });
      } else {
        await createCategory({ name: catForm.name, subcategories: subItems });
        toast.success('Category created!', { style: { borderRadius: '12px' } });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category', { style: { borderRadius: '12px' } });
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products using this category will lose their category reference.`)) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted', { style: { borderRadius: '12px' } });
      fetchCategories();
    } catch {
      toast.error('Failed to delete category', { style: { borderRadius: '12px' } });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Category Form */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
          {editingCat ? 'Edit Category' : 'Create Category'}
        </h3>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input type="text" value={catForm.name}
              onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Phones" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Subcategories
            </label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={catForm.subInput}
                onChange={e => setCatForm(f => ({ ...f, subInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubItem(); } }}
                placeholder="Add subcategory" className="input-field flex-1" />
              <button type="button" onClick={addSubItem}
                className="btn-secondary text-sm px-3 whitespace-nowrap">Add</button>
            </div>
            {subItems.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {subItems.map(s => (
                  <span key={s.slug} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300">
                    {s.name}
                    <button type="button" onClick={() => removeSubItem(s.slug)}
                      className="text-stone-400 hover:text-rose-500 transition-colors">
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {editingCat && (
              <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
            )}
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
          All Categories ({categories.length})
        </h3>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <HiOutlineCollection className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No categories yet. Create your first category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors">
                      <HiOutlinePencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {cat.subcategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map(s => (
                      <span key={s.slug} className="px-2 py-0.5 bg-white dark:bg-stone-800 rounded text-xs text-stone-500 dark:text-stone-400">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  const { userData }          = useAuth();
  const allProducts       = useProductStore(s => s.products);
  const deleteProduct     = useProductStore(s => s.deleteProduct);
  const { orders: allOrders, fetchAllOrders, updateOrder } = useOrderStore();
  const revenue = useOrderStore(s => s.getRevenue)();

  useEffect(() => {
    if (userData?.email) fetchAllOrders();
  }, [userData?.email]);

  const products     = allProducts.filter(p =>
    (p.sellerEmail || '').toLowerCase() === (userData?.email || '').toLowerCase()
  );
  const sellerOrders = allOrders || [];
  const balance      = {
    available: revenue.delivered,
    frozen: revenue.pending,
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);

  const activeTab = searchParams.get('tab') || 'overview';
  const setTab    = (key) => setSearchParams(key === 'overview' ? {} : { tab: key });

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [sellerCoupons, setSellerCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponModal, setCouponModal] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'percentage', value: '', description: '',
    minOrderAmount: '', maxUses: '', expiresAt: '',
  });

  const loadSellerCoupons = async () => {
    if (!userData?.email) return;
    setCouponsLoading(true);
    try {
      const data = await getCouponsBySeller(userData.email);
      setSellerCoupons(data);
    } catch {
      toast.error('Failed to load coupons', { style: { borderRadius: '12px' } });
    }
    setCouponsLoading(false);
  };

  useEffect(() => {
    if (activeTab !== 'coupons' || !userData?.email) return;
    let cancelled = false;
    (async () => {
      setCouponsLoading(true);
      try {
        const data = await getCouponsBySeller(userData.email);
        if (!cancelled) setSellerCoupons(data);
      } catch {
        if (!cancelled) toast.error('Failed to load coupons', { style: { borderRadius: '12px' } });
      }
      if (!cancelled) setCouponsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeTab, userData?.email]);

  const openCouponModal = (existing = null) => {
    if (existing) {
      setCouponForm({
        code: existing.code || '',
        type: existing.type || 'percentage',
        value: existing.value?.toString() || '',
        description: existing.description || '',
        minOrderAmount: existing.minOrderAmount?.toString() || '',
        maxUses: existing.maxUses?.toString() || '',
        expiresAt: existing.expiresAt?.toDate ? existing.expiresAt.toDate().toISOString().slice(0, 10) : existing.expiresAt || '',
      });
      setCouponModal(existing);
    } else {
      setCouponForm({ code: '', type: 'percentage', value: '', description: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
      setCouponModal('new');
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      if (couponModal === 'new') {
        await createCoupon({ ...couponForm, createdBy: userData?.email?.toLowerCase() || 'seller' });
        toast.success('Coupon created!', { style: { borderRadius: '12px' } });
      } else {
        await updateCoupon(couponModal.id, couponForm);
        toast.success('Coupon updated!', { style: { borderRadius: '12px' } });
      }
      setCouponModal(null);
      loadSellerCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon', { style: { borderRadius: '12px' } });
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted', { style: { borderRadius: '12px' } });
      loadSellerCoupons();
    } catch {
      toast.error('Failed to delete coupon', { style: { borderRadius: '12px' } });
    }
  };

  const couponTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
    { value: 'free_shipping', label: 'Free Shipping' },
  ];

  const handleDelete = async (id) => {
    await deleteProduct(id);
    toast.success('Product removed', {
      icon: '🗑️',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { orderStatus: newStatus });
      toast.success(`Order status updated to "${newStatus}"`, {
        style: { borderRadius: '12px' },
      });
    } catch {
      toast.error('Failed to update order status', {
        style: { borderRadius: '12px' },
      });
    }
  };

  const statsData = [
    {
      label: 'Available Balance',
      value: `$${balance.available.toFixed(2)}`,
      sub: 'Ready to withdraw',
      icon: HiOutlineCurrencyDollar,
      color: 'orange',
    },
    {
      label: 'Frozen Balance',
      value: `$${balance.frozen.toFixed(2)}`,
      sub: 'Pending delivery',
      icon: HiOutlineChartBar,
      color: 'amber',
    },
    {
      label: 'Total Orders',
      value: sellerOrders.length,
      sub: `${sellerOrders.filter(o => (o.orderStatus || o.status) === 'Pending').length} pending`,
      icon: HiOutlineShoppingBag,
      color: 'teal',
    },
    {
      label: 'Active Products',
      value: products.length,
      sub: 'Listed',
      icon: HiOutlineViewGrid,
      color: 'purple',
    },
  ];

  const colorMap = {
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    teal:   'bg-teal-100   dark:bg-teal-900/30   text-teal-600   dark:text-teal-400',
    amber:  'bg-amber-100  dark:bg-amber-900/30  text-amber-600  dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const tabs = [
    { key: 'overview',    label: 'Overview',    icon: HiOutlineChartBar    },
    { key: 'products',    label: 'Products',    icon: HiOutlineViewGrid    },
    { key: 'categories',  label: 'Categories',  icon: HiOutlineCollection  },
    { key: 'orders',      label: 'Orders',      icon: HiOutlineShoppingBag },
    { key: 'coupons',     label: 'Coupons',     icon: HiOutlineTag         },
  ];

  const statusStyle = {
    Pending:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Confirmed:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Preparing:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Shipped:        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    OutForDelivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Delivered:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelled:      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const nextOrderStatuses = {
    Pending:        ['Confirmed', 'Cancelled'],
    Confirmed:      ['Preparing', 'Cancelled'],
    Preparing:      ['Shipped', 'Cancelled'],
    Shipped:        ['OutForDelivery', 'Cancelled'],
    OutForDelivery: ['Delivered', 'Cancelled'],
    Delivered:      [],
    Cancelled:      [],
  };

  // ── Helper: thumbnail for a product (base64 or URL) ─────────────────────
  const ProductThumb = ({ product, size = 'sm' }) => {
    const dim = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
    const iconDim = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
    return product.image ? (
      <img
        src={product.image}
        alt={product.name}
        className={`${dim} rounded-xl object-cover flex-shrink-0`}
      />
    ) : (
      <div className={`${dim} rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0`}>
        <HiOutlinePhotograph className={`${iconDim} text-stone-400`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500
                            flex items-center justify-center text-white text-xl font-bold shadow">
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
                My Dashboard
              </h1>
              <p className="text-stone-500 text-sm mt-0.5">
                Welcome back, <span className="text-orange-500 font-semibold">{userData?.name?.split(' ')[0]}</span>
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add Product
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl w-fit mb-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === key
                  ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                        {stat.sub}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Recent Orders</h2>
                  <button onClick={() => setTab('orders')}
                    className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                    View all →
                  </button>
                </div>
                {sellerOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3">
                      <HiOutlineShoppingBag className="w-7 h-7 text-stone-400" />
                    </div>
                    <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No orders yet</p>
                    <p className="text-stone-400 text-sm">Orders from customers will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sellerOrders.slice(0, 4).map(order => {
                      const orderStatus = order.orderStatus || order.status || 'Pending';
                      return (
                      <div key={order.id}
                        className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                        <div>
                          <span className="font-mono text-sm font-bold text-orange-500">{order.id?.slice(0, 8)}</span>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''} · {order.customerInfo?.email || order.buyerEmail || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge text-xs ${statusStyle[orderStatus] || statusStyle.Pending}`}>
                            {orderStatus}
                          </span>
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            ${(order.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>

              {/* My Products preview */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">My Products</h2>
                  <button onClick={() => setTab('products')}
                    className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                    Manage all →
                  </button>
                </div>
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3">
                      <HiOutlineViewGrid className="w-7 h-7 text-stone-400" />
                    </div>
                    <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No products listed</p>
                    <p className="text-stone-400 text-sm mb-4">Add your first product to start selling.</p>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary py-2.5 px-5 text-sm">
                      <HiOutlinePlus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 4).map((p, i) => (
                      <div key={p.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                        <span className="text-sm font-bold text-stone-400 w-5">#{i + 1}</span>
                        <ProductThumb product={p} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.name}</p>
                          <p className="text-xs text-stone-400 capitalize">{p.category}</p>
                        </div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 flex-shrink-0">${p.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                    My Products ({products.length})
                  </h2>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-4 text-sm">
                    <HiOutlinePlus className="w-4 h-4" /> Add New
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                      <HiOutlineViewGrid className="w-7 h-7 text-stone-400" />
                    </div>
                    <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No products yet</p>
                    <p className="text-stone-400 text-sm">Click "Add New" to list your first product.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-stone-100 dark:border-stone-800">
                            {['Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <ProductThumb product={p} size="sm" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[180px]">{p.name}</p>
                                    {p.isNew && <span className="badge bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 text-xs">New</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-stone-600 dark:text-stone-400 capitalize">{p.category}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">${p.price}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link to={`/products/${p.id}`}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors">
                                    <HiOutlineEye className="w-4 h-4" />
                                  </Link>
                                  <button onClick={() => handleDelete(p.id)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                                    <HiOutlineTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
                      {products.map(p => (
                        <div key={p.id} className="p-4 flex items-center gap-3">
                          <ProductThumb product={p} size="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.name}</p>
                            <p className="text-xs text-stone-400 capitalize mt-0.5">{p.category} · ${p.price}</p>
                          </div>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CATEGORIES TAB ── */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <CategoriesManager />
            </motion.div>
          )}

          {/* ── COUPONS TAB ── */}
          {activeTab === 'coupons' && (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                    My Coupons ({sellerCoupons.length})
                  </h2>
                  <button onClick={() => openCouponModal(null)} className="btn-primary py-2 px-4 text-sm">
                    <HiOutlinePlus className="w-4 h-4" /> New Coupon
                  </button>
                </div>

                {couponsLoading ? (
                  <div className="flex justify-center py-12">
                    <svg className="animate-spin w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : sellerCoupons.length === 0 ? (
                  <div className="p-10 text-center">
                    <HiOutlineTag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No coupons yet</p>
                    <p className="text-stone-400 text-sm mb-4">Create coupons to attract more buyers.</p>
                    <button onClick={() => openCouponModal(null)} className="btn-primary py-2.5 px-5 text-sm">
                      <HiOutlinePlus className="w-4 h-4" /> Create Coupon
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {sellerCoupons.map(c => {
                      const expired = c.expiresAt ? (c.expiresAt.toDate ? c.expiresAt.toDate() : new Date(c.expiresAt)) < new Date() : false;
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors group">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            <HiOutlineTag className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-stone-900 dark:text-stone-100 uppercase">{c.code}</span>
                              <span className={`badge text-xs ${c.isActive && !expired ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                {expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {c.type === 'percentage' ? `${c.value}% off` : c.type === 'fixed' ? `$${c.value} off` : 'Free shipping'}
                              {c.minOrderAmount > 0 && ` · Min $${c.minOrderAmount}`}
                              {c.maxUses > 0 && ` · ${c.usedCount || 0}/${c.maxUses} uses`}
                              {c.description && ` · ${c.description}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openCouponModal(c)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors">
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteCoupon(c.id, c.code)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                    All Orders ({sellerOrders.length})
                  </h2>
                </div>

                {sellerOrders.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                      <HiOutlineShoppingBag className="w-7 h-7 text-stone-400" />
                    </div>
                    <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No orders yet</p>
                    <p className="text-stone-400 text-sm">Orders from customers will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {sellerOrders.map(order => {
                      const orderStatus = order.orderStatus || order.status || 'Pending';
                      const nextActions = nextOrderStatuses[orderStatus] || [];
                      return (
                      <div key={order.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <span className="font-mono text-sm font-bold text-orange-500">
                              #{order.id?.slice(0, 8).toUpperCase()}
                            </span>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {order.customerInfo?.fullName || 'Customer'} ·{' '}
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              }) : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`badge ${statusStyle[orderStatus] || statusStyle.Pending}`}>
                              {orderStatus === 'OutForDelivery' ? 'Out For Delivery' : orderStatus}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              ${(order.total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Shipping Info */}
                        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">Customer</p>
                            <p className="text-stone-900 dark:text-stone-100 font-medium">
                              {order.customerInfo?.fullName || 'N/A'}
                            </p>
                            <p className="text-stone-500">{order.customerInfo?.email || order.buyerEmail || 'N/A'}</p>
                            {order.customerInfo?.phone && (
                              <p className="text-stone-500">{order.customerInfo.phone}</p>
                            )}
                          </div>
                          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                              Shipping
                            </p>
                            <p className="text-stone-900 dark:text-stone-100 font-medium">
                              {order.customerInfo?.address || 'N/A'}
                            </p>
                            <p className="text-stone-500">
                              {order.customerInfo?.governorate || order.customerInfo?.city || ''}
                              {order.customerInfo?.zip ? ` - ${order.customerInfo.zip}` : ''}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-stone-500">
                                Est. delivery: {order.estimatedDelivery}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment & Order Status */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400">Payment:</span>
                            <span className={`font-semibold ${
                              (order.paymentStatus || 'Pending') === 'Paid'
                                ? 'text-green-600 dark:text-green-400'
                                : (order.paymentStatus || 'Pending') === 'Refunded'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name}
                                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                                  <HiOutlinePhotograph className="w-4 h-4 text-stone-400" />
                                </div>
                              )}
                              <span className="text-stone-700 dark:text-stone-300 flex-1 truncate">{item.name}</span>
                              <span className="text-stone-400 flex-shrink-0">x{item.quantity}</span>
                              <span className="font-semibold text-stone-900 dark:text-stone-100 flex-shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Status Actions */}
                        {nextActions.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-stone-100 dark:border-stone-800">
                            {nextActions.map(action => (
                              <motion.button
                                key={action}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpdateOrderStatus(order.id, action)}
                                className={`text-sm py-1.5 px-3 rounded-xl font-semibold transition-all ${
                                  action === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40'
                                }`}
                              >
                                {action === 'OutForDelivery' ? 'Out For Delivery' : action}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>

      {/* Coupon Form Modal */}
      <AnimatePresence>
        {couponModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setCouponModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card w-full max-w-lg p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                  {couponModal === 'new' ? 'Create Coupon' : 'Edit Coupon'}
                </h3>
                <button onClick={() => setCouponModal(null)} className="btn-ghost p-2 rounded-xl">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={couponForm.code}
                    onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20" className="input-field uppercase" required
                    readOnly={couponModal !== 'new'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Type</label>
                    <select value={couponForm.type}
                      onChange={e => setCouponForm(f => ({ ...f, type: e.target.value }))}
                      className="input-field cursor-pointer">
                      {couponTypeOptions.map(o => (
                        <option key={o.value} value={o.value} className="bg-white dark:bg-stone-800">{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Value <span className="text-rose-500">*</span>
                    </label>
                    <input type="number" min="0" step="0.01" value={couponForm.value}
                      onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={couponForm.type === 'percentage' ? '10' : '5'} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Description</label>
                  <input type="text" value={couponForm.description}
                    onChange={e => setCouponForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="10% off your order" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Min Order Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={couponForm.minOrderAmount}
                      onChange={e => setCouponForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                      placeholder="0" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Max Uses (0 = unlimited)</label>
                    <input type="number" min="0" value={couponForm.maxUses}
                      onChange={e => setCouponForm(f => ({ ...f, maxUses: e.target.value }))}
                      placeholder="0" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Expiry Date</label>
                  <input type="date" value={couponForm.expiresAt}
                    onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="input-field" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCouponModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {couponModal === 'new' ? 'Create Coupon' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}