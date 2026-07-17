import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLogout,
  HiOutlinePencil, HiOutlineClipboardList, HiOutlineLockClosed,
  HiOutlineCheck, HiOutlineX, HiOutlineTruck,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { useCartStore, useWishlistStore, useOrderStore } from '../store';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE  (named export — imported as: import { ProfilePage } from ...)
// ─────────────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { currentUser, userData, logout } = useAuth();
  const cartItems             = useCartStore(s => s.items);
  const wishlistItems         = useWishlistStore(s => s.items);
  const { getOrdersByBuyer, fetchUserOrders } = useOrderStore();
  const navigate              = useNavigate();

  useEffect(() => {
    if (userData?.uid) fetchUserOrders(userData.uid);
  }, [userData?.uid]);

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
            Please sign in to view your profile
          </h2>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const cartTotal   = cartItems.reduce((s, i) => s + i.quantity, 0);
  const myOrders    = getOrdersByBuyer(userData.email);
  const orderCount  = myOrders.length;

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Sidebar ── */}
          <div className="space-y-6">

            {/* Profile card — no avatar, initials only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 text-center"
            >
              {/* Initials circle */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500
                              flex items-center justify-center text-white text-3xl font-bold
                              shadow-lg mx-auto mb-4">
                {userData?.name?.charAt(0).toUpperCase()}
              </div>

              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                {userData.name}
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{userData.email}</p>

              <span className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                {'\u{1F6CD}\uFE0F'} Customer
              </span>

              {/* Live counters */}
              <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="text-center">
                  <div className="font-bold text-stone-900 dark:text-stone-100">{orderCount}</div>
                  <div className="text-xs text-stone-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    {wishlistItems.length}
                  </div>
                  <div className="text-xs text-stone-500">Wishlist</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-stone-900 dark:text-stone-100">{cartTotal}</div>
                  <div className="text-xs text-stone-500">Cart</div>
                </div>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4"
            >
              {[
                { icon: HiOutlineUser,        label: 'Edit Profile', to: '/profile/edit' },
                { icon: HiOutlineShoppingBag, label: `My Orders (${orderCount})`, to: '/orders/my-orders' },
                ...(userData?.role === 'buyer'
                  ? [{ icon: HiOutlineHeart, label: 'Wishlist', to: '/wishlist' }]
                  : []),
              ].map(({ icon: Icon, label, to }) => (
                <button
                  key={label}
                  onClick={() =>
                    to
                      ? navigate(to)
                      : toast('Coming soon!', { icon: '🚧', style: { borderRadius: '12px' } })
                  }
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                             text-stone-700 dark:text-stone-300
                             hover:bg-stone-100 dark:hover:bg-stone-800
                             transition-colors text-sm font-medium"
                >
                  <Icon className="w-5 h-5 text-stone-400" />
                  <span className="flex-1 text-left">{label}</span>
                  <span className="text-stone-400">›</span>
                </button>
              ))}

              <div className="border-t border-stone-100 dark:border-stone-800 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                             text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30
                             transition-colors text-sm font-medium"
                >
                  <HiOutlineLogout className="w-5 h-5" />
                  Sign Out
                </button>
              </div>

              
            </motion.div>
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                  Personal Information
                </h3>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="flex items-center gap-1.5 text-sm text-orange-500
                             hover:text-orange-600 font-semibold transition-colors group"
                >
                  <HiOutlinePencil className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Edit
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: HiOutlineUser,           label: 'Full Name', value: userData?.name  },
                    { icon: HiOutlineMail,           label: 'Email',     value: userData?.email },
                    { icon: HiOutlinePhone,          label: 'Phone',     value: 'Not set'   },
                    { icon: HiOutlineLocationMarker, label: 'Location',  value: 'Not set'   },
                  ].map(({ icon: Icon, label, value }) => (
                  <div key={label}
                       className="flex items-center gap-3 p-4
                                  bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                    <Icon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-stone-400 mb-0.5">{label}</div>
                      <div className={`text-sm font-medium truncate ${
                        value === 'Not set'
                          ? 'text-stone-400 italic'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}>
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order History — real data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                  Order History
                </h3>
                {myOrders.length > 0 && (
                  <button
                    onClick={() => navigate('/orders/my-orders')}
                    className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    View all →
                  </button>
                )}
              </div>

              {myOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-2xl
                                  flex items-center justify-center mb-4">
                    <HiOutlineClipboardList className="w-8 h-8 text-stone-400" />
                  </div>
                  <p className="font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    No orders yet
                  </p>
                  <p className="text-stone-400 text-sm mb-5">
                    Your completed orders will appear here.
                  </p>
                  <Link to="/products" className="btn-primary py-2.5 px-6 text-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.slice(0, 3).map(order => (
                    <div
                      key={order.id}
                      onClick={() => navigate('/orders/my-orders')}
                      className="flex items-center justify-between p-4
                                 bg-stone-50 dark:bg-stone-800/50 rounded-xl
                                 hover:bg-stone-100 dark:hover:bg-stone-800
                                 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-orange-500">{order.id}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          }) : ''}
                          {' · '}{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge text-xs ${
                          (order.orderStatus || order.status) === 'Delivered'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : (order.orderStatus || order.status) === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : (order.orderStatus || order.status) === 'Confirmed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : (order.orderStatus || order.status) === 'Shipped'
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {order.orderStatus || order.status}
                        </span>
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {myOrders.length > 3 && (
                    <button
                      onClick={() => navigate('/orders/my-orders')}
                      className="w-full py-2.5 text-sm text-orange-500 hover:text-orange-600
                                 font-semibold transition-colors text-center"
                    >
                      View {myOrders.length - 3} more orders →
                    </button>
                  )}
                </div>
              )}
            </motion.div>


          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER STATUS TRACKING TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
const ORDER_STATUS_FLOW = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'OutForDelivery', 'Delivered'];

function OrderTimeline({ currentStatus }) {
  const status = currentStatus === 'Cancelled' ? null : currentStatus;
  const currentIdx = status ? ORDER_STATUS_FLOW.indexOf(status) : -1;

  return (
    <div className="space-y-1">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const isCompleted = currentIdx >= i;
        const isCurrent = currentIdx === i;
        const label = s === 'OutForDelivery' ? 'Out For Delivery' : s;
        return (
          <div key={s} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isCurrent
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-400'
              }`}>
                {isCompleted ? '\u2713' : i + 1}
              </div>
            </div>
            <div className="pb-3">
              <p className={`text-sm font-semibold ${
                isCompleted
                  ? 'text-green-600 dark:text-green-400'
                  : isCurrent
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-stone-400 dark:text-stone-500'
              }`}>
                {label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS PAGE — buyer's real orders from useOrderStore
// ─────────────────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const { currentUser, userData } = useAuth();
  const { getOrdersByBuyer, confirmDelivery, fetchUserOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.uid) fetchUserOrders(userData.uid);
  }, [userData?.uid]);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full
                          flex items-center justify-center mb-4 mx-auto">
            <HiOutlineLockClosed className="w-12 h-12 text-stone-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            Please log in to view your orders.
          </p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const orders = getOrdersByBuyer(userData?.email);

  const handleConfirmDelivery = async (orderId) => {
    try {
      await confirmDelivery(orderId);
      toast.success('Delivery confirmed! Payment released to seller.', {
        icon: '\u2705',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    } catch {
      toast.error('Failed to confirm delivery. Please try again.', {
        style: { borderRadius: '12px' },
      });
    }
  };

  const statusStyle = {
    Pending:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Confirmed:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Preparing:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Shipped:        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    OutForDelivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Delivered:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelled:      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              My Orders
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => navigate('/products')} className="btn-secondary text-sm py-2 px-4">
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full
                            flex items-center justify-center mb-4 mx-auto">
              <HiOutlineShoppingBag className="w-12 h-12 text-stone-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-600 dark:text-stone-400 mb-1">
              No orders yet
            </h3>
            <p className="text-stone-400 text-sm mb-6">Your purchases will appear here.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, i) => {
              const orderStatus = order.orderStatus || order.status || 'Pending';
              return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-6"
              >
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="font-mono text-sm font-bold text-orange-500">
                      {order.id?.startsWith('ORD-') ? order.id : `#${order.id?.slice(0, 8).toUpperCase()}`}
                    </span>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
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

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 p-3
                                             bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                        <img
                          src={item.image || 'https://placehold.co/100?text=No+Img'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping Info & Payment Status */}
                <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                  {order.customerInfo?.address && (
                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                        <HiOutlineTruck className="w-3.5 h-3.5 inline mr-1" />
                        Shipping
                      </p>
                      <p className="text-stone-900 dark:text-stone-100 font-medium">
                        {order.customerInfo.address}
                      </p>
                      <p className="text-stone-500">
                        {order.customerInfo.governorate || order.customerInfo.city || ''}
                        {order.customerInfo.zip ? ` - ${order.customerInfo.zip}` : ''}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-stone-500">Est: {order.estimatedDelivery}</p>
                      )}
                    </div>
                  )}
                  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">Payment</p>
                    <p className={`font-semibold ${
                      (order.paymentStatus || 'Pending') === 'Paid'
                        ? 'text-green-600 dark:text-green-400'
                        : (order.paymentStatus || 'Pending') === 'Refunded'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </p>
                    {order.paymentMethod?.type && (
                      <p className="text-stone-500 text-xs">{order.paymentMethod.type} ****{order.paymentMethod.last4}</p>
                    )}
                  </div>
                </div>

                {/* Order Tracking Timeline */}
                {orderStatus !== 'Cancelled' ? (
                  <div className="mb-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wider">Order Progress</p>
                    <OrderTimeline currentStatus={orderStatus} />
                  </div>
                ) : (
                  <div className="mb-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold">
                      <HiOutlineX className="w-4 h-4" />
                      Order Cancelled
                    </div>
                  </div>
                )}

                {/* Actions */}
                {orderStatus === 'OutForDelivery' && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleConfirmDelivery(order.id)}
                    className="btn-primary text-sm py-2.5 px-5"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    Confirm Delivery
                  </motion.button>
                )}
                {orderStatus === 'Delivered' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <HiOutlineCheck className="w-4 h-4" />
                    Delivered & Paid
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

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST PAGE  (named export — buyer-only, guarded in App.jsx)
// ─────────────────────────────────────────────────────────────────────────────
export function WishlistPage() {
  const { items, toggleItem } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-full
                          flex items-center justify-center mx-auto mb-6">
            <HiOutlineHeart className="w-12 h-12 text-rose-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            Save items you love to your wishlist.
          </p>
          <Link to="/products" className="btn-primary text-base px-8 py-4">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">
              My Wishlist
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              {items.length} saved {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={() => {
              items.forEach(item => addItem(item));
              toast.success('All items added to cart!', {
                icon: '🛒',
                style: { borderRadius: '12px' },
              });
            }}
            className="btn-primary"
          >
            Add All to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product, i) => {
            // Inline product card to avoid circular dep
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={product.image || 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1 capitalize">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm
                                 leading-snug mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
                      ${product.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(product);
                        toast('Removed from wishlist', {
                          icon: '💔',
                          style: { borderRadius: '12px' },
                        });
                      }}
                      className="text-rose-500 hover:text-rose-600 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}