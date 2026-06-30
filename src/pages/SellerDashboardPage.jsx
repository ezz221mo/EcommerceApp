import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineViewGrid, HiOutlineShoppingBag,
  HiOutlineChartBar, HiOutlineCurrencyDollar,
  HiOutlineTrash, HiOutlineEye, HiOutlineX, HiOutlinePhotograph,
  HiOutlineUpload,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { useProductStore, useOrderStore } from '../store';
import toast from 'react-hot-toast';

// ─── Add Product Modal (with image upload) ────────────────────────────────────
function AddProductModal({ onClose }) {
  const addProduct = useProductStore(s => s.addProduct);
  const { userData } = useAuth();
  const fileRef    = useRef(null);

  const [form, setForm] = useState({
    name: '', price: '', category: 'electronics',
    stock: '', description: '', features: '',
  });
  const [imageFile,    setImageFile]    = useState(null);   // File object
  const [imagePreview, setImagePreview] = useState('');     // base64 data URL
  const [loading,      setLoading]      = useState(false);

  // ── Convert selected file → base64 data URL ──────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', { style: { borderRadius: '12px' } });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB', { style: { borderRadius: '12px' } });
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error('Please fill Name and Price', { style: { borderRadius: '12px' } });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // imagePreview is already a base64 string — store it directly
    addProduct({
      ...form,
      image:       imagePreview || '',
      sellerEmail: userData?.email,
      features: form.features
        ? form.features.split(',').map(f => f.trim()).filter(Boolean)
        : [],
    });

    toast.success('Product added successfully! 🎉', {
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
              Product Image
            </label>

            {imagePreview ? (
              /* Preview + remove */
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-orange-400 shadow-md">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-rose-600
                             text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                  {imageFile?.name}
                </div>
              </div>
            ) : (
              /* Drop zone */
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-300 dark:border-stone-600
                           hover:border-orange-400 dark:hover:border-orange-400
                           rounded-2xl p-8 flex flex-col items-center justify-center gap-3
                           transition-colors duration-200 cursor-pointer group bg-stone-50 dark:bg-stone-800/30"
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800
                                group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20
                                flex items-center justify-center transition-colors">
                  <HiOutlineUpload className="w-6 h-6 text-stone-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300
                                group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">PNG, JPG, WEBP · Max 5 MB</p>
                </div>
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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
              Category
            </label>
            <select value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field cursor-pointer">
              {['electronics', 'fashion', 'home', 'beauty', 'sports', 'books'].map(c => (
                <option key={c} value={c} className="capitalize bg-white dark:bg-stone-800">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  const { userData }          = useAuth();
  const allProducts       = useProductStore(s => s.products);
  const deleteProduct     = useProductStore(s => s.deleteProduct);
  const { getOrdersBySeller, getSellerBalance } = useOrderStore();

  const products     = allProducts.filter(p =>
    (p.sellerEmail || '').toLowerCase() === (userData?.email || '').toLowerCase()
  );
  const sellerOrders = getOrdersBySeller(userData?.email || '');
  const balance      = getSellerBalance(userData?.email || '');

  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);

  const activeTab = searchParams.get('tab') || 'overview';
  const setTab    = (key) => setSearchParams(key === 'overview' ? {} : { tab: key });

  const handleDelete = (id) => {
    deleteProduct(id);
    toast.success('Product removed', {
      icon: '🗑️',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
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
      sub: `${sellerOrders.filter(o => o.status === 'Pending').length} pending`,
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
    { key: 'overview', label: 'Overview', icon: HiOutlineChartBar    },
    { key: 'products', label: 'Products', icon: HiOutlineViewGrid    },
    { key: 'orders',   label: 'Orders',   icon: HiOutlineShoppingBag },
  ];

  const statusStyle = {
    Pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
                Seller Dashboard
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
                    {sellerOrders.slice(0, 4).map(order => (
                      <div key={order.id}
                        className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                        <div>
                          <span className="font-mono text-sm font-bold text-orange-500">{order.id}</span>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {new Date(order.placedAt).toLocaleDateString()} · {order.buyerEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge text-xs ${statusStyle[order.status] || statusStyle.Pending}`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    {sellerOrders.map(order => (
                      <div key={order.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <span className="font-mono text-sm font-bold text-orange-500">{order.id}</span>
                            <p className="text-xs text-stone-400 mt-0.5">
                              Buyer: {order.buyerEmail} ·{' '}
                              {new Date(order.placedAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`badge ${statusStyle[order.status] || statusStyle.Pending}`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
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
                      </div>
                    ))}
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
    </div>
  );
}