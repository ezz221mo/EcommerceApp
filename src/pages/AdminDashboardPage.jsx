import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUsers, HiOutlineShoppingBag, HiOutlineViewGrid, HiOutlineClipboardList,
  HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineTag, HiOutlineX, HiOutlineCheck,
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
} from 'react-icons/hi';
import { useProductStore, useOrderStore } from '../store';
import {
  getSellerApplicationsByStatus,
  approveSellerApplication,
  rejectSellerApplication,
} from '../services/sellerApplicationService';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../services/couponService';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const allProducts = useProductStore(s => s.products);
  const allOrders = useOrderStore(s => s.orders);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (key) => setSearchParams(key === 'overview' ? {} : { tab: key });

  const [applications, setApplications] = useState({ pending: [], approved: [], rejected: [] });
  const [appLoading, setAppLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAppLoading(true);
      try {
        const [pending, approved, rejected] = await Promise.all([
          getSellerApplicationsByStatus('Pending'),
          getSellerApplicationsByStatus('Approved'),
          getSellerApplicationsByStatus('Rejected'),
        ]);
        if (!cancelled) setApplications({ pending, approved, rejected });
      } catch {
        if (!cancelled) toast.error('Failed to load applications', { style: { borderRadius: '12px' } });
      }
      if (!cancelled) setAppLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshApps = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        getSellerApplicationsByStatus('Pending'),
        getSellerApplicationsByStatus('Approved'),
        getSellerApplicationsByStatus('Rejected'),
      ]);
      setApplications({ pending, approved, rejected });
    } catch {
      toast.error('Failed to refresh applications', { style: { borderRadius: '12px' } });
    }
  };

  const handleApprove = async (app) => {
    try {
      await approveSellerApplication(app.id, app.uid);
      toast.success(`Approved ${app.storeName}`, { style: { borderRadius: '12px' } });
      refreshApps();
    } catch {
      toast.error('Failed to approve', { style: { borderRadius: '12px' } });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    try {
      await rejectSellerApplication(rejectModal.id, rejectReason.trim());
      toast.success('Application rejected', { style: { borderRadius: '12px' } });
      setRejectModal(null);
      setRejectReason('');
      refreshApps();
    } catch {
      toast.error('Failed to reject', { style: { borderRadius: '12px' } });
    }
  };

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponModal, setCouponModal] = useState(null); // null | 'new' | coupon obj (edit)
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'percentage', value: '', description: '',
    minOrderAmount: '', maxUses: '', expiresAt: '',
  });

  const loadCoupons = async () => {
    setCouponsLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons', { style: { borderRadius: '12px' } });
    }
    setCouponsLoading(false);
  };

  useEffect(() => {
    if (activeTab !== 'coupons') return;
    let cancelled = false;
    (async () => {
      setCouponsLoading(true);
      try {
        const data = await getAllCoupons();
        if (!cancelled) setCoupons(data);
      } catch {
        if (!cancelled) toast.error('Failed to load coupons', { style: { borderRadius: '12px' } });
      }
      if (!cancelled) setCouponsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

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
        await createCoupon({ ...couponForm, createdBy: 'admin' });
        toast.success('Coupon created!', { style: { borderRadius: '12px' } });
      } else {
        await updateCoupon(couponModal.id, couponForm);
        toast.success('Coupon updated!', { style: { borderRadius: '12px' } });
      }
      setCouponModal(null);
      loadCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon', { style: { borderRadius: '12px' } });
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted', { style: { borderRadius: '12px' } });
      loadCoupons();
    } catch {
      toast.error('Failed to delete coupon', { style: { borderRadius: '12px' } });
    }
  };

  const couponTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
    { value: 'free_shipping', label: 'Free Shipping' },
  ];

  const stats = [
    {
      label: 'Total Users',
      value: '—',
      icon: HiOutlineUsers, color: 'blue',
      sub: 'Registered accounts',
    },
    {
      label: 'Pending Applications',
      value: applications.pending.length,
      icon: HiOutlineClipboardList, color: 'amber',
      sub: 'Awaiting review',
    },
    {
      label: 'Approved Sellers',
      value: applications.approved.length,
      icon: HiOutlineUsers, color: 'teal',
      sub: 'Active sellers',
    },
    {
      label: 'Total Products',
      value: allProducts.length,
      icon: HiOutlineViewGrid, color: 'purple',
      sub: 'Across all sellers',
    },
    {
      label: 'Total Orders',
      value: allOrders.length,
      icon: HiOutlineShoppingBag, color: 'orange',
      sub: `${allOrders.filter(o => o.status === 'Pending').length} pending`,
    },
    {
      label: 'Revenue',
      value: `$${allOrders.reduce((s, o) => s + o.total, 0).toFixed(0)}`,
      icon: HiOutlineCurrencyDollar, color: 'green',
      sub: 'Gross revenue',
    },
  ];

  const colorMap = {
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: HiOutlineChartBar },
    { key: 'users', label: 'Users', icon: HiOutlineUsers },
    { key: 'applications', label: 'Seller Apps', icon: HiOutlineClipboardList },
    { key: 'products', label: 'Products', icon: HiOutlineViewGrid },
    { key: 'orders', label: 'Orders', icon: HiOutlineShoppingBag },
    { key: 'coupons', label: 'Coupons', icon: HiOutlineTag },
  ];

  const ApplicationCard = ({ app, type }) => {
    const submittedDate = app.submittedAt?.toDate
      ? app.submittedAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5 border-l-4"
        style={{
          borderLeftColor: type === 'pending' ? '#d97706' : type === 'approved' ? '#059669' : '#dc2626',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(app.userName || app.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 truncate text-sm">
                  {app.userName || app.name || 'Unknown'}
                </h4>
                <p className="text-xs text-stone-400 truncate">{app.email || app.userEmail || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-3">
              <div><span className="text-stone-400">Store:</span> <span className="font-medium text-stone-700 dark:text-stone-300">{app.storeName}</span></div>
              <div><span className="text-stone-400">Phone:</span> <span className="font-medium text-stone-700 dark:text-stone-300">{app.phone}</span></div>
              <div><span className="text-stone-400">Gov:</span> <span className="font-medium text-stone-700 dark:text-stone-300">{app.governorate}</span></div>
              <div className="col-span-2 sm:col-span-3"><span className="text-stone-400">Description:</span> <span className="text-stone-600 dark:text-stone-400">{app.storeDescription}</span></div>
              <div><span className="text-stone-400">Address:</span> <span className="text-stone-600 dark:text-stone-400">{app.fullAddress}</span></div>
              <div><span className="text-stone-400">Submitted:</span> <span className="text-stone-600 dark:text-stone-400">{submittedDate}</span></div>
            </div>
            {type === 'rejected' && app.rejectionReason && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Rejection Reason:</p>
                <p className="text-sm text-rose-700 dark:text-rose-400/80">{app.rejectionReason}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {type === 'pending' && (
              <>
                <button onClick={() => handleApprove(app)}
                  className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                  title="Approve">
                  <HiOutlineCheck className="w-5 h-5" />
                </button>
                <button onClick={() => setRejectModal(app)}
                  className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                  title="Reject">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const tabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{stat.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{stat.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Recent Activity</h2>
              {allOrders.length === 0 ? (
                <p className="text-stone-400 text-sm">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {allOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                      <div>
                        <span className="font-mono text-xs font-bold text-orange-500">{order.id}</span>
                        <p className="text-xs text-stone-400">{order.buyerEmail} · {new Date(order.placedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Pending Applications ({applications.pending.length})
              </h2>
              {appLoading ? (
                <div className="flex justify-center py-6">
                  <svg className="animate-spin w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : applications.pending.length > 0 ? (
                <div className="space-y-3">
                  {applications.pending.slice(0, 3).map(app => (
                    <ApplicationCard key={app.id} app={app} type="pending" />
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-sm">No pending applications.</p>
              )}
              {applications.pending.length > 3 && (
                <button onClick={() => setTab('applications')} className="text-sm text-orange-500 hover:text-orange-600 font-semibold mt-3">View all →</button>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Users Management</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">—</p>
                <p className="text-sm text-stone-500">Total Users</p>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl">
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{applications.approved.length}</p>
                <p className="text-sm text-stone-500">Approved Sellers</p>
              </div>
            </div>
            <p className="text-stone-400 text-sm">User management features coming soon. For now, use Seller Applications to manage seller accounts.</p>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-8">
            {['pending', 'approved', 'rejected'].map(type => (
              <div key={type} className="card p-6">
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4 capitalize">
                  {type} Applications ({applications[type].length})
                </h3>
                {appLoading ? (
                  <div className="flex justify-center py-6">
                    <svg className="animate-spin w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : applications[type].length > 0 ? (
                  <div className="space-y-3">
                    {applications[type].map(app => (
                      <ApplicationCard key={app.id} app={app} type={type} />
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm">No {type} applications.</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'products':
        return (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">All Products ({allProducts.length})</h2>
            </div>
            {allProducts.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-stone-400">No products yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {allProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                    <span className="text-xs font-bold text-stone-400 w-6">#{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.name}</p>
                      <p className="text-xs text-stone-400">${p.price} · {p.category}</p>
                    </div>
                    <span className="text-xs text-stone-500">{p.sellerEmail || 'Admin'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">All Orders ({allOrders.length})</h2>
            </div>
            {allOrders.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-stone-400">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {allOrders.map(order => (
                  <div key={order.id} className="p-5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-orange-500">{order.id}</span>
                      <div className="flex items-center gap-3">
                        <span className={`badge text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                        <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-400">{order.buyerEmail} · {new Date(order.placedAt).toLocaleDateString()} · {order.items.length} items</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'coupons':
        return (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Coupons ({coupons.length})
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
            ) : coupons.length === 0 ? (
              <div className="p-10 text-center">
                <HiOutlineTag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="font-semibold text-stone-600 dark:text-stone-400 mb-1">No coupons yet</p>
                <p className="text-stone-400 text-sm mb-4">Create your first coupon to start promoting sales.</p>
                <button onClick={() => openCouponModal(null)} className="btn-primary py-2.5 px-5 text-sm">
                  <HiOutlinePlus className="w-4 h-4" /> Create Coupon
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {coupons.map(c => {
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow">
            A
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Admin Dashboard</h1>
            <p className="text-stone-500 text-sm mt-0.5">Manage your marketplace</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl w-fit mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === key ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            {tabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

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

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => { setRejectModal(null); setRejectReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card w-full max-w-md p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Reject Application</h3>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-ghost p-2 rounded-xl">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Rejecting <strong className="text-stone-700 dark:text-stone-300">{rejectModal?.storeName}</strong>. You must provide a reason.
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="input-field resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleRejectConfirm} disabled={!rejectReason.trim()}
                  className="btn-primary flex-1 justify-center bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-lg shadow-rose-600/20">
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}