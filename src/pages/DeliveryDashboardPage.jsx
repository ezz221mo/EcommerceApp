import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingBag, HiOutlineUser, HiOutlinePhone,
  HiOutlineLocationMarker, HiOutlineTruck, HiOutlineCheck,
  HiOutlineX, HiOutlineExclamationCircle, HiOutlineClock,
  HiOutlinePhotograph, HiOutlineArrowRight,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { getDeliveryOrders, updateDeliveryStatus } from '../services/deliveryService';

const DELIVERY_STATUS_FLOW = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'confirmed', label: 'Confirm Order' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const FAILURE_STATUSES = [
  { key: 'delivery_failed', label: 'Delivery Failed' },
  { key: 'customer_not_available', label: 'Customer Not Available' },
];

const RETURN_REASONS = [
  'Sick',
  'Vehicle Issue',
  'Wrong Delivery Zone',
  'Personal Emergency',
  'Other',
];

const statusStyle = {
  assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  picked_up: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  out_for_delivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  delivery_failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  customer_not_available: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  returned: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
};

const statusLabel = {
  assigned: 'Assigned',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  delivery_failed: 'Delivery Failed',
  customer_not_available: 'Customer Not Available',
  returned: 'Returned',
  unassigned: 'Unassigned',
};

function Timeline({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <HiOutlineClock className="w-3 h-3 text-orange-500" />
            </div>
            {i < entries.length - 1 && <div className="w-0.5 flex-1 bg-stone-200 dark:bg-stone-700" />}
          </div>
          <div className="pb-2">
            <p className="text-xs font-medium text-stone-900 dark:text-stone-100">
              {statusLabel[entry.status] || entry.status}
            </p>
            <p className="text-xs text-stone-400">
              {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
              {entry.note && entry.note !== statusLabel[entry.status] ? ` · ${entry.note}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DeliveryDashboardPage() {
  const { currentUser, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  const loadOrders = async (showToast = false) => {
    if (!currentUser) return;
    if (!userData || userData.role !== 'delivery') {
      console.log('[DeliveryDashboard] User role is not delivery — skipping order load');
      return;
    }
    setLoading(true);
    try {
      console.log('[DeliveryDashboard] Loading orders for uid:', currentUser.uid);
      const data = await getDeliveryOrders(currentUser.uid);
      console.log('[DeliveryDashboard] Loaded', data.length, 'orders');
      setOrders(data);
    } catch (err) {
      console.error('[DeliveryDashboard] Error loading orders:', err?.code, err?.message);
      if (showToast) toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('[DeliveryDashboard] Mount — currentUser:', currentUser?.uid, 'userData:', userData);
    loadOrders(true);
    const interval = setInterval(() => {
      console.log('[DeliveryDashboard] Polling refresh');
      loadOrders(false);
    }, 30000);
    return () => {
      console.log('[DeliveryDashboard] Cleanup');
      clearInterval(interval);
    };
  }, [currentUser, userData]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateDeliveryStatus(orderId, status);
      toast.success(`Status updated to ${statusLabel[status]}`);
      loadOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleReturn = async () => {
    if (!returnModal || !returnReason.trim()) return;
    try {
      await updateDeliveryStatus(returnModal, 'returned', returnReason.trim());
      toast.success('Order returned successfully');
      setReturnModal(null);
      setReturnReason('');
      loadOrders();
    } catch {
      toast.error('Failed to return order');
    }
  };

  const visibleStatuses = (deliveryStatus) => {
    const idx = DELIVERY_STATUS_FLOW.findIndex(s => s.key === deliveryStatus);
    if (idx === -1) return [{ key: deliveryStatus, label: statusLabel[deliveryStatus] || deliveryStatus }];
    return DELIVERY_STATUS_FLOW.slice(0, idx + 1);
  };

  const getNextStatuses = (deliveryStatus) => {
    const idx = DELIVERY_STATUS_FLOW.findIndex(s => s.key === deliveryStatus);
    if (idx === -1 || idx >= DELIVERY_STATUS_FLOW.length - 1) return [];
    return [DELIVERY_STATUS_FLOW[idx + 1]];
  };

  const currentStatus = (order) => order.delivery?.deliveryStatus || 'unassigned';

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <HiOutlineTruck className="w-8 h-8 text-orange-500" />
              Delivery Dashboard
            </h1>
            <p className="text-stone-500 mt-1">
              Welcome, {userData?.name?.split(' ')[0]} · {orders.length} order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 mx-auto">
              <HiOutlineShoppingBag className="w-12 h-12 text-stone-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-600 dark:text-stone-400 mb-1">No orders assigned</h3>
            <p className="text-stone-400 text-sm">Orders from your delivery zones will appear here automatically.</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, i) => {
              const dStatus = currentStatus(order);
              const nextActions = getNextStatuses(dStatus);
              const completed = dStatus === 'delivered' || dStatus === 'delivery_failed' || dStatus === 'customer_not_available';
              const canReturn = !completed && dStatus !== 'returned' && dStatus !== 'unassigned';
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <span className="font-mono text-sm font-bold text-orange-500">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${statusStyle[dStatus] || 'bg-stone-100 text-stone-600'}`}>
                        {statusLabel[dStatus] || dStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                        <HiOutlineUser className="w-3.5 h-3.5 inline mr-1" />Customer
                      </p>
                      <p className="text-stone-900 dark:text-stone-100 font-medium">
                        {order.customerInfo?.fullName || 'N/A'}
                      </p>
                      {order.customerInfo?.phone && (
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                          <HiOutlinePhone className="w-3.5 h-3.5" /> {order.customerInfo.phone}
                        </p>
                      )}
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5 inline mr-1" />Shipping
                      </p>
                      <p className="text-stone-900 dark:text-stone-100 font-medium">{order.customerInfo?.address || 'N/A'}</p>
                      <p className="text-stone-500">
                        {order.customerInfo?.governorate || order.customerInfo?.city || ''}
                        {order.customerInfo?.zip ? ` - ${order.customerInfo.zip}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="text-stone-400">Payment:</span>
                    <span className={`font-semibold ${
                      order.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>{order.paymentStatus || 'Pending'}</span>
                  </div>

                  {/* Products */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                            <HiOutlinePhotograph className="w-4 h-4 text-stone-400" />
                          </div>
                        )}
                        <span className="text-stone-700 dark:text-stone-300 flex-1 truncate">{item.name}</span>
                        <span className="text-stone-400 flex-shrink-0">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <p className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wider">Timeline</p>
                      <Timeline entries={order.timeline} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-stone-100 dark:border-stone-800">
                    {nextActions.map(action => (
                      <motion.button
                        key={action.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusUpdate(order.id, action.key)}
                        className="text-sm py-1.5 px-3 rounded-xl font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 transition-all"
                      >
                        <HiOutlineArrowRight className="w-3.5 h-3.5 inline mr-1" />
                        {action.label}
                      </motion.button>
                    ))}
                    {!completed && dStatus !== 'delivered' && dStatus !== 'returned' && dStatus !== 'unassigned' && (
                      <>
                        {FAILURE_STATUSES.map(fs => (
                          <motion.button
                            key={fs.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStatusUpdate(order.id, fs.key)}
                            className="text-sm py-1.5 px-3 rounded-xl font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-all"
                          >
                            {fs.label}
                          </motion.button>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setReturnModal(order.id); setReturnReason(''); }}
                          className="text-sm py-1.5 px-3 rounded-xl font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 transition-all"
                        >
                          Return Assignment
                        </motion.button>
                      </>
                    )}
                    {order.delivery?.returnReason && (
                      <div className="w-full text-xs text-stone-400 mt-2">
                        Return reason: <span className="font-medium text-stone-600 dark:text-stone-300">{order.delivery.returnReason}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Reason Modal */}
      <AnimatePresence>
        {returnModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setReturnModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card w-full max-w-md p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <HiOutlineExclamationCircle className="w-5 h-5 text-orange-500" />
                  Return Assignment
                </h3>
                <button onClick={() => setReturnModal(null)} className="btn-ghost p-2 rounded-xl">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-stone-500 mb-4">Please provide a reason for returning this order:</p>
              <div className="space-y-2 mb-6">
                {RETURN_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setReturnReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      returnReason === reason
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 ring-2 ring-orange-500/30'
                        : 'bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReturnModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={handleReturn}
                  disabled={!returnReason.trim()}
                  className="btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  Return Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
