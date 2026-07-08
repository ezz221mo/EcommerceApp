import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUser, HiOutlineShoppingBag, HiOutlineHeart,
  HiOutlineClipboardList, HiOutlineLogout, HiOutlineLocationMarker,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { useCartStore, useWishlistStore, useOrderStore } from '../store';
import toast from 'react-hot-toast';

export default function BuyerDashboardPage() {
  const { currentUser, userData, logout } = useAuth();
  const cartItems = useCartStore(s => s.items);
  const wishlistItems = useWishlistStore(s => s.items);
  const { getOrdersByBuyer } = useOrderStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">Please sign in to view your dashboard</h2>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const myOrders = getOrdersByBuyer(userData.email);
  const cartTotal = cartItems.reduce((s, i) => s + i.quantity, 0);

  const actions = [
    { icon: HiOutlineUser,        label: 'My Profile',        to: '/profile' },
    { icon: HiOutlineShoppingBag, label: `Orders (${myOrders.length})`, to: '/orders/my-orders' },
    { icon: HiOutlineHeart,       label: `Wishlist (${wishlistItems.length})`, to: '/wishlist' },
    { icon: HiOutlineClipboardList, label: `Cart (${cartTotal})`, to: '/cart' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">{userData.name}</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm">{userData.email}</p>
              <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                🛍️ Buyer
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {actions.map(({ icon: Icon, label, to }) => (
              <button key={label} onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Icon className="w-6 h-6 text-orange-500" />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
            <button onClick={handleLogout} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium text-sm transition-colors">
              <HiOutlineLogout className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}